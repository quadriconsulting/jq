# Author: Jeremy Quadri
import os
import re
import json
import time
import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path

import requests
from sentence_transformers import SentenceTransformer

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]
INDEX_NAME = os.environ.get("VEC_INDEX_NAME", "jq-rag")

CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", "2200"))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", "350"))
UPSERT_BATCH = int(os.environ.get("UPSERT_BATCH", "64"))

CACHE_DB = os.environ.get("CACHE_DB", ".cache/vector_cache.sqlite")

DOCS = [
    "about.md",
    "cv.md",
    "cv_facts.md",
    "cv_qa.md",
    "projects.md",
    "projects_qa.md",
    "projects_facts.md",
    "fam.md",
]


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def slug(s: str) -> str:
    s = (s or "root").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return (s[:50] or "root")


def make_vid(doc: str, title: str, idx: int) -> str:
    """
    Cloudflare Vectorize ID limit: 64 bytes.
    Build a short stable id:
      prefix(6) + ":" + sec(12) + ":" + digest(32)  => ~52 chars
    """
    prefix = (doc.replace(".md", "")[:6] or "doc")
    sec = slug(title)[:12]
    digest = sha256(f"{doc}|{title}|{idx}")[:32]
    return f"{prefix}:{sec}:{digest}"


def split_by_headings(md: str):
    lines = md.replace("\r\n", "\n").split("\n")
    sections = []
    current_title = "root"
    current = []
    for line in lines:
        m = re.match(r"^(#{1,3})\s+(.*)\s*$", line)
        if m:
            if "".join(current).strip():
                sections.append((current_title, "\n".join(current).strip()))
            current_title = m.group(2).strip()
            current = []
        else:
            current.append(line)
    if "".join(current).strip():
        sections.append((current_title, "\n".join(current).strip()))
    return sections if sections else [("root", md.strip())]


def chunk_text(text: str, size: int, overlap: int):
    t = (text or "").strip()
    if not t:
        return []
    out = []
    i = 0
    while i < len(t):
        end = min(i + size, len(t))
        out.append(t[i:end])
        if end >= len(t):
            break
        i = max(0, end - overlap)
    return out


def find_doc_path(name: str) -> Path:
    # Canonical: rag_docs/
    candidates = [
        Path("rag_docs") / name,
        Path(name),
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError(f"Could not find {name} in rag_docs/ or repo root")


def init_db(db_path: str):
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS embeddings (
          hash TEXT PRIMARY KEY,
          dims INTEGER NOT NULL,
          vec_json TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def get_cached(conn, h: str):
    row = conn.execute("SELECT vec_json FROM embeddings WHERE hash=?", (h,)).fetchone()
    if not row:
        return None
    return json.loads(row[0])


def put_cached(conn, h: str, dims: int, vec):
    conn.execute(
        "INSERT OR REPLACE INTO embeddings(hash, dims, vec_json, updated_at) VALUES(?,?,?,?)",
        (h, dims, json.dumps(vec), datetime.utcnow().isoformat()),
    )


def cf_upsert(vectors):
    """
    Upsert vectors into Cloudflare Vectorize V2.
    Hard-fail if Cloudflare returns success=false.
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/{INDEX_NAME}/upsert"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {"vectors": vectors}
    r = requests.post(url, headers=headers, json=payload, timeout=60)

    if not r.ok:
        raise RuntimeError(f"Upsert failed {r.status_code}: {r.text[:800]}")

    data = r.json()
    if not data.get("success"):
        raise RuntimeError(f"Upsert success=false: {json.dumps(data)[:1200]}")

    return data


def main():
    now = datetime.utcnow().isoformat()
    conn = init_db(CACHE_DB)

    # Local embeddings model (768 dims)
    model = SentenceTransformer("BAAI/bge-base-en-v1.5")

    items = []
    loaded = []
    for doc in DOCS:
        p = find_doc_path(doc)
        loaded.append(str(p))
        text = p.read_text(encoding="utf-8")
        doc_type = "personal" if doc == "fam.md" else "professional"

        for (title, content) in split_by_headings(text):
            chunks = chunk_text(content, CHUNK_SIZE, CHUNK_OVERLAP)
            for idx, ch in enumerate(chunks):
                vid = make_vid(doc, title, idx)
                items.append(
                    {
                        "id": vid,
                        "text": ch,
                        "meta": {
                            "type": doc_type,
                            "source": doc,
                            "section": title or "root",
                            "updated_at": now,
                            # store snippet for retrieval prompt
                            "chunk": ch[:1400],
                        },
                    }
                )

    # Embed + upsert in batches with sqlite cache
    to_upsert = []
    new_embeds = 0
    cached_embeds = 0

    batch_texts = []
    batch_refs = []

    last_upsert_resp = None

    def flush_embed_batch():
        nonlocal new_embeds, to_upsert, batch_texts, batch_refs
        if not batch_texts:
            return
        vecs = model.encode(batch_texts, normalize_embeddings=True).tolist()
        for (ref, vec) in zip(batch_refs, vecs):
            h = sha256(ref["text"])
            put_cached(conn, h, len(vec), vec)
            new_embeds += 1
            to_upsert.append(
                {
                    "id": ref["id"],
                    "values": vec,
                    "metadata": ref["meta"],
                }
            )
        conn.commit()
        batch_texts = []
        batch_refs = []

    for it in items:
        h = sha256(it["text"])
        cached = get_cached(conn, h)
        if cached is not None:
            cached_embeds += 1
            to_upsert.append(
                {
                    "id": it["id"],
                    "values": cached,
                    "metadata": it["meta"],
                }
            )
        else:
            batch_texts.append(it["text"])
            batch_refs.append(it)
            if len(batch_texts) >= 16:
                flush_embed_batch()

        if len(to_upsert) >= UPSERT_BATCH:
            last_upsert_resp = cf_upsert(to_upsert[:UPSERT_BATCH])
            to_upsert = to_upsert[UPSERT_BATCH:]
            time.sleep(0.25)

    flush_embed_batch()

    while to_upsert:
        chunk = to_upsert[:UPSERT_BATCH]
        last_upsert_resp = cf_upsert(chunk)
        to_upsert = to_upsert[UPSERT_BATCH:]
        time.sleep(0.25)

    print("DONE")
    print(f"Loaded: {loaded}")
    print(f"Docs: {len(DOCS)}")
    print(f"Chunks: {len(items)}")
    print(f"Embeddings: new={new_embeds} cached={cached_embeds}")
    print(f"Index: {INDEX_NAME}")
    print("Last upsert response:", json.dumps(last_upsert_resp)[:800])


if __name__ == "__main__":
    main()
