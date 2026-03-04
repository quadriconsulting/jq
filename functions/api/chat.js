// functions/api/chat.js

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";

  try {
    const body = await safeJson(request);
    const message = (body?.message || "").toString().slice(0, 4000);

    if (!message.trim()) {
      return Response.json({ reply: "Ask me a question and I’ll help." }, { status: 400 });
    }

    // bindings check
    if (!env.AI || !env.VEC_INDEX) {
      return Response.json(
        { ok: false, step: "bindings", hasAI: !!env.AI, hasVEC_INDEX: !!env.VEC_INDEX },
        { status: 500 }
      );
    }

    // 1) Embed
    let qEmb;
    try {
      qEmb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [message] });
    } catch (e) {
      return Response.json(
        { ok: false, step: "embed", error: String(e?.message || e) },
        { status: 500 }
      );
    }

    const qVec = (qEmb.data || qEmb)[0];

    // 2) Query vectorize
    const topK = 6;
    let res;
    try {
      const filter = isExplicitPersonalIntent(message) ? undefined : { type: "professional" };
      res = await env.VEC_INDEX.query(qVec, { topK, filter, returnMetadata: true });
    } catch (e) {
      // fallback without filter
      try {
        res = await env.VEC_INDEX.query(qVec, { topK: 12, returnMetadata: true });
      } catch (e2) {
        return Response.json(
          { ok: false, step: "vector_query", error: String(e2?.message || e2) },
          { status: 500 }
        );
      }
    }

    const arr = res?.matches || res || [];
    const matches = Array.isArray(arr) ? arr : [];

    const wantPersonal = isExplicitPersonalIntent(message);
    const trimmed = wantPersonal
      ? matches.slice(0, topK)
      : matches.filter(m => m?.metadata?.type !== "personal").slice(0, topK);

    // debug response (NO OpenAI call)
    if (debug) {
      return Response.json({
        ok: true,
        step: "debug",
        wantPersonal,
        matchCount: trimmed.length,
        hasAnyChunk: trimmed.some(m => Boolean(m?.metadata?.chunk)),
        sources: trimmed.map(m => m?.metadata?.source).filter(Boolean),
        sampleMetaKeys: trimmed[0]?.metadata ? Object.keys(trimmed[0].metadata) : []
      });
    }

    // Build ctx snippets for real answer mode
    const ctx = trimmed
      .map((m, i) => {
        const meta = m.metadata || {};
        const snippet = (meta.chunk || "").toString().trim();
        return `[#${i + 1} ${meta.source || "doc"} | ${meta.section || "root"} | type=${meta.type || "?"}]\n${snippet}`;
      })
      .join("\n\n---\n\n");

    const system = `
You are a professional assistant for Jeremy Quadri's background and project capabilities.

STRICT RULE (PERSONAL CONTENT):
- Do not volunteer personal details.
- Only use personal info if the user explicitly asked about hobbies, food/drinks, restaurants, lifestyle preferences, or personal interests.

RAG RULE:
- Use ONLY the retrieved context snippets when answering.
- If the snippets do not contain the answer, say what is missing and ask ONE short follow-up question.
`.trim();

    const user = `
User question:
${message}

Retrieved context snippets:
${ctx}

Answer using the snippets above.
`.trim();

    const reply = await callOpenAI(env.OPENAI_API_KEY, system, user);

    return Response.json({
      reply,
      suggested: suggestFollowups(wantPersonal),
    });
  } catch (err) {
    // last-resort catch: ALWAYS return JSON
    return Response.json(
      {
        ok: false,
        step: "top_level",
        error: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

async function callOpenAI(apiKey, system, user) {
  if (!apiKey) return "OpenAI API key missing on server.";

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
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
    }),
  });

  if (!resp.ok) return `Service error (${resp.status}).`;

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

function suggestFollowups(wantPersonal) {
  if (wantPersonal) {
    return [
      "What sports or hobbies do you enjoy most?",
      "What food and drink do you like?",
      "What do you do outside of work?",
    ];
  }
  return [
    "What AppSec areas are you strongest in?",
    "Describe your SAST/auto-fix safety approach.",
    "How do you build risk scoring from threat intel sources?",
  ];
}

async function safeJson(req) {
  try { return await req.json(); } catch { return {}; }
}
