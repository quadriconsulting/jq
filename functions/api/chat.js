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
  const uuid = (body?.uuid || "").toString().slice(0, 64).trim();

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
CRITICAL MANDATE: You MUST detect the language of the User's message and reply entirely in that EXACT SAME language. Ignore the language of the Context.

ROLE
You are a professional assistant representing Jeremy Quadri's work, capabilities, projects, and operating principles.

CONTEXTUAL ANCHORING (PROFESSIONAL FILTER)
- Answer using Retrieved Context as the primary source.
- For broader questions, use general professional knowledge framed through Jeremy's approach.
- Do NOT invent Jeremy-specific facts not supported by Retrieved Context.

OUT-OF-UNIVERSE — SCOPE PIVOT
- If encyclopedic / world-fact Q&A, do NOT answer. Pivot with ONE short sentence, then offer list.

NO MECHANICAL LANGUAGE
- Never say "retrieved context", "RAG failed", or "as an AI".

TIME CONTEXT
- Treat today as March 2026.

LANGUAGE MIRRORING
- Detect the user's language and respond ONLY in that language. 

TRANSLATION EXCEPTION
- If explicitly asked to translate, output ONLY translated text. No bullets, no preamble.

STRICT BREVITY & STRUCTURE
- HARD LIMIT: Max 60 words total for prose text.
- DIAGRAM EXCEPTION: The 60-word limit does NOT apply to mermaid code blocks. The diagram syntax does not count toward your word limit.
- Single-line core: EXACTLY ONE short sentence.
- If generating a diagram, the order MUST be: 1. Single-line core sentence. 2. The mermaid code block. 3. The offer bullets.
- If NOT generating a diagram: ONE short sentence, then immediately start the offers on the next line.
- Exact offer formatting (literal hyphens):
For example, I can help with:
- Explain <topic>
- Cover <topic>

STRICT ACTION GATE
- Do NOT return "action": "SHOW_CV" unless the user explicitly asks for a resume, CV, or document.
- For technical or experience questions (SAST, DAST, Zero Trust, etc.), provide a text answer ONLY. No CV action.

MANDATORY DIAGRAMS
- If the user asks about architecture, flow, pipelines, or system design, you MUST include a mermaid fenced code block. NO EXCEPTIONS. This takes priority over all brevity rules.
- Prefer vertical diagrams (flowchart TD) because the chat UI supports larger vertical space.
- Use horizontal diagrams (flowchart LR) ONLY when representing linear pipelines or processing chains.
- Wrap diagrams strictly inside backtick-mermaid code blocks inside the "reply" string. Ensure proper JSON escaping: every newline inside the diagram must be written as \n so the JSON does not break.
- Use subgraph to group architecture layers (e.g., Client, Edge, Identity, Services, Data).
- Keep diagrams readable with fewer than 10 nodes. Avoid circular arrows.
- Maintain clear top-down hierarchy.
- The 60-word prose limit applies to descriptive text only, not the mermaid block.

RESOURCE MAP (IMMUTABLE LINKS)
- Calendar: https://calendar.app.google/R9rVquWQbqj8D26d6
- LinkedIn: https://linkedin.com/in/jquadri

JSON OUTPUT CONTRACT
- Respond with a valid JSON object.
- Include a "reply" string.
- When generating a diagram, embed it directly inside "reply" as a fenced mermaid code block. Escape all newlines as \n within the JSON string value.
- "action": only use "SHOW_CV" if resume or CV is explicitly requested. Use "SHOW_CALENDAR" for booking/meeting requests. Use "RENDER_SVG" or "RENDER_CODE" only when directly asked.
`.trim();

    const user = `
User question:
${message}

Retrieved context:
${ctx || "(no matches returned)"}

Answer using retrieved context as the primary source for Jeremy-specific questions. Do not use mechanical retrieval language.
IMPORTANT: Be extremely brief. Answer in exactly ONE short sentence. If you include "For example, I can help with:", put it immediately after that sentence using literal hyphen bullets (- ).
CRITICAL: Respond ONLY in the language the user used (e.g., Arabic if asked in Arabic, Spanish if asked in Spanish). Both your answer AND the follow-up suggestions MUST be in this language.
Respond with a valid JSON object containing at minimum a "reply" string.
`.trim();

  const rawReply = await callOpenAI(env.OPENAI_API_KEY, system, user, debug);

  // 7) Hard char cap — bypass when user explicitly wants detail
  let { reply: rawReplyText, action, codeSnippet } = rawReply;
  // Strip SHOW_CV from AI output unless user explicitly requested it
  const cvExplicit = /\b(download cv|your cv|send resume|get resume|share cv|see cv)\b/i.test(message);
  if (action === 'SHOW_CV' && !cvExplicit) action = undefined;
  // Deterministic fallback: force action flags if the AI forgets
  const lowerMsg = message.toLowerCase();
  if (!action) {
    if (cvExplicit) action = 'SHOW_CV';
    else if (/\b(calendar|book time|schedule|hire|meet|call)\b/.test(lowerMsg)) action = 'SHOW_CALENDAR';
  }
  const hasDiagram = (rawReplyText || '').includes('```mermaid');
  const reply = (wantsDetail(message) || hasDiagram)
    ? (rawReplyText || '').trim()
    : capReply(rawReplyText, HARD_CHAR_CAP);

  return Response.json({
    reply,
    suggested: buildSuggestedFromReply(reply, wantPersonal, message),
    action,
    codeSnippet,
  });
}

function normalizeMatches(res) {
  if (!res) return { matches: [] };
  if (Array.isArray(res)) return { matches: res };
  if (Array.isArray(res.matches)) return { matches: res.matches };
  return { matches: [] };
}

async function callOpenAI(apiKey, system, user, debugMode = false) {
  if (!apiKey) return { reply: "OpenAI API key missing on server." };

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
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    const isTimeout = e?.name === "AbortError";
    return {
      reply: isTimeout
        ? "The assistant took too long to respond. Please try again."
        : "Unable to reach the assistant. Please try again.",
    };
  }
  clearTimeout(timer);

  if (!resp.ok) {
    if (debugMode) {
      const bodyText = await safeText(resp);
      return { reply: `Service error (openaiStatus=${resp.status}): ${truncate(bodyText, 300)}` };
    }
    return { reply: "The assistant is temporarily unavailable. Please try again." };
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) return { reply: "No response." };
  let clean = content.trim();
  clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return { reply: clean.replace(/[{}]/g, '').trim() };
  }
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

function isAmbiguousAboutSelf(msg) {
    const lower = msg.toLowerCase();

    // 1. Check if it contains general "about you" phrasing
    const hasGenericPrompt = /(tell me about (you|jeremy|yourself)|who (are you|is jeremy))/.test(lower);

    // 2. Check if it contains specific professional/technical keywords
    const hasTechFocus = /(sast|dast|experience|work|background|security|appsec|zero trust|architecture|code|skills)/.test(lower);

    // It is ONLY ambiguous if it asks a generic question AND doesn't mention technical topics
    return hasGenericPrompt && !hasTechFocus;
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
