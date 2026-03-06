// functions/api/debug-vectorize.js

export async function onRequestGet({ request, env }) {
  if (!env.AI || !env.VEC_INDEX) {
    return Response.json({ ok: false, error: "Missing AI/Vectorize bindings" }, { status: 500 });
  }

  // Use a fixed query so this endpoint is stable
  const probe = "SAST DAST SBOM risk scoring EPSS";

  const emb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [probe] });
  const vec = (emb?.data || emb || [])[0] || [];

  if (!Array.isArray(vec) || vec.length !== 768) {
    return Response.json({ ok: false, error: "Bad embedding dims", got: Array.isArray(vec) ? vec.length : 0 }, { status: 500 });
  }

  const topK = 3;
  const res = await env.VEC_INDEX.query(vec, { topK, returnMetadata: true });

  const matches = Array.isArray(res?.matches) ? res.matches : (Array.isArray(res) ? res : []);
  const sample = matches.map(m => {
    const meta = m?.metadata || {};
    const chunk = (meta.chunk || "").toString();
    return {
      id: m.id,
      score: m.score,
      metaKeys: Object.keys(meta),
      source: meta.source,
      section: meta.section,
      type: meta.type,
      updated_at: meta.updated_at,
      chunkPreview: chunk.slice(0, 280),
    };
  });

  return Response.json({
    ok: true,
    topK,
    matchCount: matches.length,
    sample,
    note: "Non-zero matches confirms this Pages binding can read vectors from the index.",
  });
}
