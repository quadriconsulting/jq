// Author: Jeremy Quadri
export async function onRequestGet({ env }) {
  return Response.json({
    hasAI: !!env.AI,
    hasVEC_INDEX: !!env.VEC_INDEX,
  });
}
