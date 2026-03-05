// functions/api/debug-vectorize.js
export async function onRequestGet({ env, request }) {
  // Basic binding presence check
  if (!env || !env.VEC_INDEX) {
    return Response.json(
      {
        ok: false,
        error: "Missing Vectorize binding (env.VEC_INDEX).",
        hasEnv: Boolean(env),
        hasVEC_INDEX: Boolean(env?.VEC_INDEX),
      },
      { status: 500 }
    );
  }

  // Allow overriding topK via querystring: ?topK=5
  const url = new URL(request.url);
  const topK = Math.max(1, Math.min(Number(url.searchParams.get("topK") || "3"), 10));

  // Your index is 768 dims (bge-base-en-v1.5). Use a zero vector for a cheap smoke test.
  const zero = Array(768).fill(0);

  try {
    const res = await env.VEC_INDEX.query(zero, { topK, returnMetadata: true });

    // SDK may return { matches: [...] } or an array-like
    const matches = res?.matches || res || [];
    const sample = matches.slice(0, Math.min(2, matches.length)).map((m) => {
      const meta = m?.metadata || {};
      return {
        id: m?.id,
        score: m?.score,
        metaKeys: Object.keys(meta),
        source: meta.source,
        section: meta.section,
        type: meta.type,
        updated_at: meta.updated_at,
        chunkPreview: (meta.chunk || "").toString().slice(0, 220),
      };
    });

    return Response.json({
      ok: true,
      topK,
      matchCount: matches.length,
      sample,
      note:
        matches.length === 0
          ? "matchCount=0 means: (a) this Pages binding points to an empty index OR (b) you seeded a different account/index than this Pages project uses."
          : "Non-zero matches confirms this Pages binding can read vectors from the index.",
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error: String(e),
        hint:
          "If this errors, check: binding name VEC_INDEX, index dimensions (768), Cloudflare account alignment, and that Vectorize is enabled on this account.",
      },
      { status: 500 }
    );
  }
}
