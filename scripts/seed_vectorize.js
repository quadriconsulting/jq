import fs from "node:fs/promises";
import path from "node:path";

const SITE = process.env.SITE || "https://j.quadri.fit";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // optional if you keep auth
const TOP = "rag_docs";

async function main() {
  const files = [
    "cv.md",
    "cv_facts.md",
    "cv_qa.md",
    "projects.md",
    "projects_qa.md",
    "projects_facts.md",
    "fam.md",
  ];

  // Fetch docs from live site (so you don't fight build paths)
  const docs = [];
  for (const f of files) {
    const url = `${SITE}/${f}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Missing doc: ${url} (${res.status})`);
    const text = await res.text();
    docs.push({ path: f, text });
  }

  // Call your existing /api/rag/seed in small batches
  // (You already started adding cursor/limit support earlier.)
  // If your seed endpoint is not paginated yet, we can add it next.
  console.log("Docs fetched:", docs.length);
  console.log("Now seed via /api/rag/seed (needs pagination to avoid CPU limit).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
