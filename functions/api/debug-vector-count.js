// Author: Jeremy Quadri
export async function onRequestGet({ env }) {
  // Query with any vector (use a fixed embedding)
  const emb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: ["test"] });
  const vec = (emb.data || emb)[0];

  const res = await env.VEC_INDEX.query(vec, { topK: 1, returnMetadata: true });
  const matches = res.matches || res || [];

  return Response.json({
    ok: true,
    topK: 1,
    matchCount: matches.length,
    note: "If matchCount=0, index is empty (not seeded) or binding is wrong."
  });
}
