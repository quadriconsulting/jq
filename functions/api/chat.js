// Author: Jeremy Quadri
// functions/api/chat.js

// Reply length policy
// SOFT_CHAR_TARGET: model instruction target (best-effort)
// HARD_CHAR_CAP:    server-side ceiling; replies longer than this are cleanly truncated
//                  (bypassed when user explicitly requests detail)
const SOFT_CHAR_TARGET = 280;
const HARD_CHAR_CAP    = 480;

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";

  const body = await safeJson(request);
  const message = (body?.message || "").toString().slice(0, 4000).trim();

  if (!message) {
    return Response.json({ reply: "Ask me a question and I'll help." }, { status: 400 });
  }

  const wantPersonal = isExplicitPersonalIntent(message);
  const ambiguousSelf = isAmbiguousAboutSelf(message);

  // Fail fast if bindings are missing
  if (!env?.AI || !env?.VEC_INDEX) {
    const payload = debug
      ? { ok: false, error: "MISSING_BINDINGS", hasAI: Boolean(env?.AI), hasVEC_INDEX: Boolean(env?.VEC_INDEX) }
      : { reply: "Assistant is not configured yet (missing AI/Vectorize bindings).", suggested: suggestFollowups(false) };
    return Response.json(payload, { status: 500 });
  }

  // 1) Embed the query
  let qVec = [];
  try {
    const qEmb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [message] });
    qVec = (qEmb?.data || qEmb || [])[0] || [];
  } catch (e) {
    return Response.json(
      debug
        ? { ok: false, error: "EMBEDDING_FAILED", qVecLen: 0, note: "Embedding call threw (Workers AI binding/model)." }
        : { reply: "Assistant error: embedding step failed. Please try again.", suggested: suggestFollowups(wantPersonal) },
      { status: 500 }
    );
  }

  const qVecLen = Array.isArray(qVec) ? qVec.length : 0;
  if (qVecLen !== 768) {
    return Response.json(
      debug
        ? { ok: false, error: "BAD_QUERY_VECTOR", qVecLen, expected: 768 }
        : { reply: "Assistant error: invalid query vector. Please try again.", suggested: suggestFollowups(wantPersonal) },
      { status: debug ? 400 : 500 }
    );
  }

  // 2) Baseline query (unfiltered) — proves index is populated
  const baselineTopK = 12;
  const topK = 6;

  let baselineMatches = [];
  try {
    const baseline = await env.VEC_INDEX.query(qVec, { topK: baselineTopK, returnMetadata: true });
    baselineMatches = normalizeMatches(baseline).matches;
  } catch (e) {
    return Response.json(
      debug
        ? { ok: false, error: "VECTOR_BASELINE_QUERY_FAILED", qVecLen }
        : { reply: "Assistant error: vector search failed. Please try again.", suggested: suggestFollowups(wantPersonal) },
      { status: 500 }
    );
  }

  const baselineCount = baselineMatches.length;
  const baselineSources = uniq(
    baselineMatches.map(m => (m?.metadata?.source || "").toString()).filter(Boolean)
  );

  // 3) Filtered query (professional-only unless explicit personal intent)
  const filterUsed = wantPersonal ? null : { type: "professional" };
  let matches = [];
  let fallbackUsed = false;
  try {
    const filtered = await env.VEC_INDEX.query(qVec, { topK, filter: filterUsed || undefined, returnMetadata: true });
    matches = normalizeMatches(filtered).matches;

    // Resilience: metadata index may be newly created / still propagating.
    // If the filtered query succeeded but returned 0 results while the
    // baseline found vectors, fall back to post-filtering the baseline so
    // the chat never looks broken during index warm-up.
    if (!wantPersonal && matches.length === 0 && baselineCount > 0) {
      matches = baselineMatches
        .filter(m => (m?.metadata?.type || "").toLowerCase() !== "personal")
        .slice(0, topK);
      fallbackUsed = true;
    }
  } catch {
    // Fallback: post-filter from baseline (or a fresh broader query)
    try {
      const raw = await env.VEC_INDEX.query(qVec, { topK: 12, returnMetadata: true });
      const arr = normalizeMatches(raw).matches;
      matches = arr.filter(m => wantPersonal || m?.metadata?.type !== "personal").slice(0, topK);
    } catch (e2) {
      return Response.json(
        debug
          ? { ok: false, error: "VECTOR_QUERY_FAILED", qVecLen, baselineCount }
          : { reply: "Search is temporarily unavailable. Please try again.", suggested: suggestFollowups(wantPersonal) },
        { status: 500 }
      );
    }
  }

  const matchCount = matches.length;
  const sources = uniq(matches.map(m => (m?.metadata?.source || "").toString()).filter(Boolean));

  // DEBUG MODE: metadata only (NO raw chunk text, NO personal content)
  if (debug) {
    const sample = matches.slice(0, 3).map(m => {
      const meta = m?.metadata || {};
      return {
        id: m?.id,
        score: m?.score,
        source: meta?.source,
        section: meta?.section,
        type: meta?.type,
        metaKeys: Object.keys(meta),
        hasChunk: Boolean(meta?.chunk),
        chunkLen: meta?.chunk ? String(meta.chunk).length : 0,
      };
    });

    return Response.json({
      ok: true,
      step: "debug",
      wantPersonal,
      qVecLen,
      filterUsed,
      baselineCount,
      matchCount,
      baselineSources,
      filteredSources: sources,
      sources,
      fallbackUsed,
      sample,
      note: "baselineCount>0 = index populated + binding OK. matchCount=0 with baselineCount>0 = metadata index missing or vectors need re-seeding. fallbackUsed=true = metadata filter returned 0 so results were post-filtered from baseline (normal during index warm-up).",
    });
  }

  // 4) Ambiguous “about yourself” -> default professional unless explicitly personal
  if (ambiguousSelf && !wantPersonal) {
    return Response.json({
      reply: "Do you mean Jeremy’s professional background or personal interests? (If you don’t specify, I’ll answer professionally.)",
      suggested: suggestFollowups(false),
    });
  }

  // 5) Build internal context from retrieved chunks (NOT returned to user)
  const CHUNK_CAP = 800;
  const ctx = matches
    .map((m, i) => {
      const meta = m?.metadata || {};
      const chunk = (meta?.chunk || "").toString().trim().slice(0, CHUNK_CAP);
      const header = `[#${i + 1} ${meta.source || "doc"} | ${meta.section || "root"} | type=${meta.type || "?"}]`;
      return chunk ? `${header}\n${chunk}` : `${header}\n(no chunk)`;
    })
    .join("\n\n---\n\n");

  // 6) System prompt — PROFESSIONAL FILTER MODE
  const system = `
ROLE
You are a professional assistant representing Jeremy Quadri's work, capabilities, projects, and operating principles.

CONTEXTUAL ANCHORING (PROFESSIONAL FILTER)
- If the user asks about Jeremy (background, projects, methods, experience), answer using the Retrieved Context as the primary source.
- If the user asks broader questions within Jeremy's professional domains (AppSec, DevSecOps, SAST/SCA/DAST, SBOM, IaC, secrets, risk scoring, autonomous remediation, CI/CD gates, WAF, vuln management), you MAY use general professional knowledge — but frame it through Jeremy's approach:
  - Focus on decision criteria, safe defaults, trade-offs, and operational patterns.
  - Do NOT invent Jeremy-specific facts not supported by Retrieved Context.

OUT-OF-UNIVERSE — SCOPE PIVOT
- If the question is primarily encyclopedic / world-fact Q&A (politics, history, geography, celebrity news, sports scores, etc.), do NOT answer the factual question.
- Respond with exactly ONE short pivot sentence, then immediately start the offer list on the next line (no blank line, no extra paragraph).

NO MECHANICAL LANGUAGE
- Never say: "retrieved context does not include", "according to the documents", "RAG failed", "my context".
- If something cannot be anchored to Jeremy's work, pivot with one sentence then offer list.

AMBIGUITY HANDLING
- If the user's question is vague with no clear anchor, ask ONE short clarifying question.
- If there is an obvious anchor (SBOM, EPSS, SAST, etc.), assume that domain and answer.

TIME CONTEXT
- Treat today as March 2026 for relative time phrasing only.
- Do NOT present time-sensitive world facts or statistics as current.

PERSONAL CONTENT RULE
- Do not volunteer personal details.
- Only answer personal questions if the user explicitly asks about hobbies, fitness, snowboarding, motorcycling, food/drinks, restaurants, or lifestyle.
- If ambiguous ("tell me about yourself"), ask which they mean and default to professional.

LANGUAGE MIRRORING
- Detect the language of the user's message and reply in that same language by default.
- If the user explicitly requests a target language (e.g., "translate to French"), use that target language.
- If the user mixes languages, respond in the dominant language unless a target language is specified.
- IMPORTANT: Language mirroring does NOT disable the normal reply structure (one sentence + optional offer bullets). Only explicit translation requests trigger "translation-only" output.

TRANSLATION EXCEPTION (ABSOLUTE)
- Only when the user is explicitly asking for translation (e.g., "translate...", "traducir...", "\u062a\u0631\u062c\u0645...", "\xfcbersetzen...") output ONLY the translated text.
- No preamble, no bullets, no extra commentary.
- This overrides ALL other rules including brevity and offer formatting.

STRICT BREVITY & STRUCTURE
- HARD LIMIT: Max 60 words total per reply (excluding pure translation output).
- Zero filler: No pleasantries, no meta commentary, no "as an AI", no "based on context", no explanations about retrieval.
- Single-line core: Write exactly ONE short sentence that either answers (Jeremy-universe) or pivots (out-of-scope).
- Do not reuse the exact same sentence across turns; vary wording while staying factual.
- Offer list only when useful: Include the offer list only if (a) you pivoted, or (b) the user's question is broad/underspecified, or (c) the user asked what you can help with / examples / options.
- Front-load offers: If you include offers, write the one sentence, then immediately start the offers on the next line. No extra paragraphs between them.
- Offer bullets must be actionable (NOT skills/facts): Every bullet must start with an offer verb and describe help you can provide.
- Allowed offer verbs: Explain, Cover, Walk through, Compare, Summarize, Discuss.
- Allowed "Discuss" form: "Discuss Jeremy's experience with ..."
- Never output a skills list as offer bullets.
- Exact required offer formatting — use real newlines and literal hyphens (- ), not unicode bullets:

For example, I can help with:
- Explain <topic>
- Cover <topic>
- Walk through <topic>

SAFETY
- Do not output secrets, tokens, API keys, or credentials.
- Do not output runnable commands or code blocks unless explicitly requested.

CRITICAL FINAL DIRECTIVE
- World-fact question (politics / history / geography) → ONE pivot sentence + offer list immediately. Do NOT answer the fact. Stop.
- Translation request → output ONLY the translated string. Nothing else.
- Violating these two constraints is a system failure.
`.trim();

  const user = `
User question:
${message}

Retrieved context:
${ctx || "(no matches returned)"}

Answer the user using retrieved context as the primary source for Jeremy-specific questions. For broader questions within Jeremy's professional domains, answer with anchored professional guidance consistent with Jeremy's approach. Do not invent Jeremy-specific facts. Do not use mechanical retrieval language.
IMPORTANT: Be extremely brief. Answer in exactly ONE short sentence. If you include "For example, I can help with:", put it immediately after that sentence using literal hyphen bullets (- ) so it is not cut off by the hard character limit.
`.trim();

  const rawReply = await callOpenAI(env.OPENAI_API_KEY, system, user, debug);

  // 7) Hard char cap — bypass when user explicitly wants detail
  const reply = wantsDetail(message)
    ? rawReply.trim()
    : capReply(rawReply, HARD_CHAR_CAP);

  return Response.json({
    reply,
    suggested: buildSuggestedFromReply(reply, wantPersonal, message),
  });
}

function normalizeMatches(res) {
  if (!res) return { matches: [] };
  if (Array.isArray(res)) return { matches: res };
  if (Array.isArray(res.matches)) return { matches: res.matches };
  return { matches: [] };
}

async function callOpenAI(apiKey, system, user, debugMode = false) {
  if (!apiKey) return "OpenAI API key missing on server.";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  let resp;
  try {
    resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 220,
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    const isTimeout = e?.name === "AbortError";
    return isTimeout
      ? "The assistant took too long to respond. Please try again."
      : "Unable to reach the assistant. Please try again.";
  }
  clearTimeout(timer);

  if (!resp.ok) {
    if (debugMode) {
      const bodyText = await safeText(resp);
      return `Service error (openaiStatus=${resp.status}): ${truncate(bodyText, 300)}`;
    }
    return "The assistant is temporarily unavailable. Please try again.";
  }

  const data = await resp.json();
  return data?.choices?.[0]?.message?.content?.trim() || "No response.";
}

function isExplicitPersonalIntent(q) {
  const s = q.toLowerCase();
  const keywords = [
    "hobby", "hobbies", "outside work", "personal", "free time",
    "food", "drink", "cocktail", "restaurant", "cigar",
    "snowboard", "snowboarding", "motorcycle", "motorcycling",
    "fitness", "gym", "favourite", "favorite",
  ];
  return keywords.some(k => s.includes(k));
}

function isAmbiguousAboutSelf(q) {
  const s = q.toLowerCase().trim();
  return (
    s.includes("tell me about yourself") ||
    s.includes("about yourself") ||
    s.includes("tell me about you") ||
    s === "about you" ||
    s.includes("tell me about jeremy")
  );
}

function suggestFollowups(wantPersonal) {
  if (wantPersonal) {
    return [
      "What hobbies or sports do you enjoy?",
      "What food and drink do you like?",
      "What do you do outside of work?",
    ];
  }
  return [
    "What AppSec areas are you strongest in?",
    "Describe your SAST/auto-fix safety approach.",
    "How do you build risk scoring from EPSS/CVSS/KEV?",
  ];
}

// ---------------------------------------------------------------------------
// Reply-aware suggestion builder
// Returns exactly 3 short question strings.
// Priority:
//   1. Offer bullets extracted from an explicit offer section of the reply
//      (Section Gating: only parsed after an offer-header line is found)
//   2. Keyword-pool routing based on reply + user message
//   3. Professional default pool
// No extra model calls; pure string parsing.
// ---------------------------------------------------------------------------

function buildSuggestedFromReply(replyText, wantPersonal, userMessage) {
  // 1) Try to extract offer bullets from the reply
  const extracted = extractOfferLines(replyText);

  if (extracted.length >= 3) {
    return extracted.slice(0, 3);
  }

  // 2) Fill remainder from keyword-pool routing
  const pool = pickPool(replyText, userMessage, wantPersonal);
  const combined = dedup([...extracted, ...pool]);
  return combined.slice(0, 3);
}

// ---------------------------------------------------------------------------
// extractOfferLines — hardened version
//
// Design constraints enforced here:
//   A) SECTION GATING    — only parse lines that appear AFTER an explicit
//                           offer-header line.  The header line itself is
//                           skipped UNLESS it is a complete standalone offer
//                           (e.g. "I can explain the SAST approach." with no
//                           following bullets).  Everything before the header
//                           is ignored.
//   B) REFUSAL EXCLUSION — drop any line containing pivot/refusal phrases.
//   C) OFFER-ONLY VALID  — accept a line only if it matches a strict offer
//                           pattern (action verb present, not a skills fact).
//   D) CLEANING          — strip scaffolding, preserve natural case, wrap as
//                           question, clamp to 90 chars.
//
// Returns up to 5 cleaned question strings (caller takes first 3).
// Returns [] when no valid offer section is found → caller uses pickPool.
// ---------------------------------------------------------------------------
function extractOfferLines(replyText) {
  const raw = (replyText || "").slice(0, 1200);
  const lines = raw.split(/\n/);

  // ── A) SECTION GATING ────────────────────────────────────────────────────
  const OFFER_HEADER_RE = /\b(for example|i can help(?: you)?(?: with)?|i can cover|i can explain|here are a few ways i can help)\b/i;

  let offerSectionStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (OFFER_HEADER_RE.test(lines[i])) {
      offerSectionStart = i;
      break;
    }
  }
  if (offerSectionStart === -1) return [];

  // ── C) OFFER-ONLY VALIDATION (defined early for use in header check) ──────
  // C1  Explicit "I can …" with a content-bearing action verb
  const C1_RE = /\b(?:i can|i can help|i can help with)\b.{0,120}\b(?:explain|cover|discuss|walk(?: through)?|break down|outline|compare|summarize)\b/i;
  // C2  "discuss Jeremy's experience with …"
  const C2_RE = /\bdiscuss\b.{0,60}\bjeremy(?:'?s)?\b.{0,60}\bexperience\b.{0,60}\bwith\b/i;
  // C3  Bullet prefixed with an offer verb (right after bullet marker)
  const C3_RE = /^[-\u2022*]\s*(?:explain|cover|walk(?: through)?|break down|outline|compare|summarize|discuss)\b/i;

  const isOffer = (line) => C1_RE.test(line) || C2_RE.test(line) || C3_RE.test(line);

  // Decide whether to include the header line as a candidate.
  // A header line is included only when it IS itself a valid offer AND has
  // substantial content remaining after stripping the header phrases — i.e. it
  // is a standalone "I can explain X" sentence, not a "I can help with:" intro.
  const headerLine = lines[offerSectionStart];
  const headerIsStandaloneOffer = isOffer(headerLine) && (() => {
    const stripped = headerLine
      .replace(/\bi can help(?: you)?(?: with)?[:]?\s*/i, "")
      .replace(/\bi can cover[:]?\s*/i, "")
      .replace(/\bi can explain[:]?\s*/i, "")
      .replace(/\bfor example[,:]?\s*/i, "")
      .trim();
    // Must have something meaningful after stripping AND must not end with ":"
    // (which would indicate it's a list intro, not a standalone offer)
    return stripped.length > 8 && !/:\s*$/.test(stripped);
  })();

  const candidateLines = headerIsStandaloneOffer
    ? lines.slice(offerSectionStart)       // header is also a candidate
    : lines.slice(offerSectionStart + 1);  // skip header (default)

  // ── B) REFUSAL / PIVOT BLACKLIST ─────────────────────────────────────────
  const REFUSAL_PHRASES = [
    "outside jeremy",
    "outside his core",
    "not in jeremy",
    "not within jeremy",
    "i can tell you about his expertise",
    "i can tell you about jeremy",
    "i can\u2019t help with",
    "i can't help with",
    "i can\u2019t answer",
    "i can't answer",
  ];
  const isRefusal = (s) => {
    const lower = s.toLowerCase();
    return REFUSAL_PHRASES.some(p => lower.includes(p));
  };

  // ── D) CLEAN + WRAP ───────────────────────────────────────────────────────
  const STRIP_PREFIXES = [
    /^[-\u2022*]\s*/,
    /^for example[,:]?\s*/i,
    // Strip "I can help (you) with" so "I can help with X" → "X"
    /^i can help you with[:]?\s*/i,
    /^i can help with[:]?\s*/i,
    // Strip only "I can " (not the verb) so "I can explain X" → "explain X"
    /^i can\s+(?=explain|cover|discuss|walk|break|outline|compare|summarize)/i,
    // Fallback: strip bare "I can:" prefix
    /^i can[:]\s*/i,
  ];

  const cleanLine = (line) => {
    let s = line.trim();
    for (const re of STRIP_PREFIXES) s = s.replace(re, "");
    return s.replace(/^[^a-zA-Z0-9]+/, "").trim();
  };

  const toQuestion = (cleaned) => {
    if (!cleaned) return null;
    if (/\?$/.test(cleaned)) return cleaned;
    // Lowercase first char so "Can you Explain" → "Can you explain"
    const lowered = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    return ("Can you " + lowered).replace(/\.?$/, "?");
  };

  // ── Scan candidate lines ──────────────────────────────────────────────────
  const results = [];
  for (const rawLine of candidateLines) {
    if (results.length >= 5) break;
    const line = rawLine.trim();
    if (!line) continue;
    if (isRefusal(line)) continue;
    if (!isOffer(line)) continue;
    const cleaned = cleanLine(line);
    if (!cleaned) continue;
    let question = toQuestion(cleaned);
    if (!question) continue;
    if (question.length > 90) question = question.slice(0, 87).trimEnd() + "\u2026";
    results.push(question);
  }
  return results;
}

// Returns a pool of 3 suggestions based on keyword routing.
function pickPool(replyText, userMessage, wantPersonal) {
  if (wantPersonal) {
    return [
      "What hobbies or sports do you enjoy?",
      "What food and drink do you like?",
      "What do you do outside of work?",
    ];
  }

  const haystack = ((replyText || "") + " " + (userMessage || "")).toLowerCase();

  // Risk scoring
  if (/\bepss\b|\bcvss\b|\bkev\b|\brisk scor|\bpriori|\bexploit intel/.test(haystack)) {
    return [
      "How do you combine EPSS, CVSS, KEV, and exploit intel?",
      "What does your risk scoring output look like in practice?",
      "How do you avoid noisy false positives in scoring?",
    ];
  }

  // CI/CD gates & remediation
  if (/\bfail-closed\b|\bautonom|\bremediat|\bci\/cd\b|\bgates?\b|\bpatch\b|auto.?fix/.test(haystack)) {
    return [
      "What deterministic gates must a fix pass?",
      "How do you prevent unsafe or non-compiling patches?",
      "When do you require human review vs auto-merge?",
    ];
  }

  // Tooling / platform
  if (/\bsast\b|\bdast\b|\bsca\b|\bsbom\b|\biac\b|\bsecrets\b|\bscanner/.test(haystack)) {
    return [
      "Which scanners do you route and why?",
      "How do you handle SBOM + dependency risk at scale?",
      "How do you operationalize findings into tickets/SLAs?",
    ];
  }

  // Professional default
  return [
    "What AppSec areas are you strongest in?",
    "Describe your SAST/auto-fix safety approach.",
    "How do you build risk scoring from EPSS/CVSS/KEV?",
  ];
}

// Deduplicates while preserving insertion order.
function dedup(arr) {
  return Array.from(new Set(arr || []));
}

function uniq(arr) {
  return Array.from(new Set(arr || []));
}

function truncate(s, n) {
  const str = (s || "").toString();
  return str.length > n ? str.slice(0, n) + "…" : str;
}

async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function safeText(resp) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

// Returns true when the user explicitly requests a long / detailed answer.
// In that case the hard char cap is skipped.
function wantsDetail(q) {
  const s = q.toLowerCase();
  return (
    s.includes("detailed") ||
    s.includes("deep dive") ||
    s.includes("step-by-step") ||
    s.includes("step by step") ||
    s.includes("explain fully") ||
    s.includes("in detail") ||
    s.includes("long") ||
    s.includes("comprehensive")
  );
}

// Caps a reply at `cap` characters, cutting at the last sentence boundary
// before the cap, or the last space, then appending "…".
function capReply(text, cap) {
  const s = (text || "").trim();
  if (s.length <= cap) return s;

  const window = s.slice(0, cap);
  // prefer last sentence-ending punctuation
  const sentEnd = Math.max(
    window.lastIndexOf("."),
    window.lastIndexOf("?"),
    window.lastIndexOf("!"),
  );
  const cut = sentEnd > cap * 0.5 ? sentEnd + 1 : window.lastIndexOf(" ");
  return (cut > 0 ? s.slice(0, cut) : window).trimEnd() + "…";
}
