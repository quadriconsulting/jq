// functions/api/debug-vectorize.js
export async function onRequestGet({ env }) {
  // Sanity checks
  if (!env.VEC_INDEX) {
    return Response.json(
      { ok: false, error: "Missing Vectorize binding: env.VEC_INDEX" },
      { status: 500 }
    );
  }

  // A zero vector with the same dimensionality as your index (768)
  const zero = Array(768).fill(0);

  try {
    const r = await env.VEC_INDEX.query(zero, { topK: 3, returnMetadata: true });

    // Vectorize SDK responses can be { matches: [...] } or sometimes an array
    const matches = r?.matches || r || [];
    const sample = matches.slice(0, 2).map((m) => ({
      id: m.id,
      score: m.score,
      metaKeys: Object.keys(m.metadata || {}),
      source: m.metadata?.source,
      section: m.metadata?.section,
      type: m.metadata?.type,
      // keep snippet short if present
      chunkPreview: (m.metadata?.chunk || "").toString().slice(0, 180),
    }));

    return Response.json({
      ok: true,
      matchCount: matches.length,
      sample,
      note:
        "If matchCount=0, your Pages binding is pointing at an empty index OR you seeded a different account/index than this Pages project uses.",
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}
