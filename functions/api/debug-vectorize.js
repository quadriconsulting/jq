export async function onRequestGet({ env }) {
  const qEmb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: ["Jeremy core AppSec capabilities"] });
  const qVec = (qEmb.data || qEmb)[0];

  const res = await env.VEC_INDEX.query(qVec, { topK: 3, returnMetadata: true });

  const matches = res.matches || res || [];
  return Response.json({
    topK: 3,
    matchCount: matches.length,
    sample: matches.map(m => ({
      id: m.id,
      score: m.score,
      source: m.metadata?.source,
      section: m.metadata?.section,
      hasChunk: !!m.metadata?.chunk
    }))
  });
}
