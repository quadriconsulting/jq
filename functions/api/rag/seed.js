// functions/api/rag/seed.js

export async function onRequestPost({ request, env }) {
const auth = request.headers.get("authorization") || request.headers.get("Authorization") || "";
const m = auth.match(/^Bearer\s+(.+)$/i);
const token = m ? m[1].trim() : "";

  // TEMP DEBUG: show only lengths + whether header exists
  if (!env.ADMIN_TOKEN || token !== String(env.ADMIN_TOKEN).trim()) {
    return Response.json(
      {
        unauthorized: true,
        hasAuthHeader: Boolean(auth),
        authStartsWithBearer: auth.startsWith("Bearer "),
        sentTokenLen: token.length,
        envTokenLen: (env.ADMIN_TOKEN ? String(env.ADMIN_TOKEN).trim().length : 0),
        note: "Lengths only (safe). If envTokenLen=0, ADMIN_TOKEN not set for this deployment/environment.",
      },
      { status: 401 }
    );
  }

  // Load markdown docs from the deployed assets.
  // In Pages Functions, you can fetch static assets by relative URL.
  // We'll maintain an explicit list to keep it deterministic.
  const files = [
    "rag_docs/cv.md",
    "rag_docs/cv_facts.md",
    "rag_docs/cv_qa.md",
    "rag_docs/projects.md",
    "rag_docs/projects_qa.md",
    "rag_docs/projects_facts.md",
    "rag_docs/fam.md",
  ];

  const docs = [];
  for (const path of files) {
    const res = await fetch(new URL(`/${path}`, request.url));
    if (!res.ok) {
      return new Response(`Missing doc: ${path} (${res.status})`, { status: 400 });
    }
    const text = await res.text();
    docs.push({ path, text });
  }

  const now = new Date().toISOString();

  // Simple chunker: ~2200 chars with overlap
  const chunkSize = 2200;
  const overlap = 350;

  const items = [];
  for (const d of docs) {
    const type = d.path.endsWith("/fam.md") ? "personal" : "professional";
    const source = d.path.split("/").pop(); // e.g. cv.md

    // Optional: split by headings first for better metadata
    const sections = splitByHeadings(d.text);

    let globalIndex = 0;
    for (const sec of sections) {
      const chunks = chunkText(sec.content, chunkSize, overlap);
      for (let i = 0; i < chunks.length; i++) {
        const id = `${source}::${slug(sec.title || "root")}::${String(globalIndex).padStart(4, "0")}`;
        globalIndex++;

        items.push({
          id,
          text: chunks[i],
          metadata: {
            type,                 // personal | professional
            source,               // cv.md, projects.md, fam.md, etc.
            section: sec.title || "root",
            updated_at: now,
          },
        });
      }
    }
  }

  // Embed in batches
  const batchSize = 32;
  const vectors = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const inputs = batch.map(x => x.text);

    const emb = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: inputs });
    // emb.data is typically an array of vectors
    const data = emb.data || emb;

    for (let j = 0; j < batch.length; j++) {
      vectors.push({
        id: batch[j].id,
        values: data[j],
        metadata: {
          ...batch[j].metadata,
          // keep the text small; store full chunk in metadata only if you want.
          // Better pattern: store chunk text alongside results in code, not as metadata.
        },
      });
    }
  }

  // Upsert to Vectorize
  await env.VEC_INDEX.upsert(vectors);

  return Response.json({
    ok: true,
    docs: docs.length,
    chunks: items.length,
    upserted: vectors.length,
  });
}

function chunkText(text, size, overlap) {
  const clean = (text || "").replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const out = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + size, clean.length);
    out.push(clean.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
    if (i >= clean.length) break;
  }
  return out;
}

function splitByHeadings(md) {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = { title: "root", content: "" };

  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.*)\s*$/);
    if (m) {
      if (current.content.trim()) sections.push(current);
      current = { title: m[2].trim(), content: "" };
    } else {
      current.content += line + "\n";
    }
  }
  if (current.content.trim()) sections.push(current);
  return sections.length ? sections : [{ title: "root", content: md }];
}

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "root";
}
