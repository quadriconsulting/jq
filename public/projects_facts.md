# Projects Facts — Security Automation Platform (Minimal)

- Built a developer-centric AppSec platform spanning SAST, SCA, DAST, secrets detection, SBOM, IaC scanning, mobile analysis, malware checks, and unified vulnerability management.
- Implemented CCN/complexity-aware hybrid SAST routing: deterministic scanning for low-complexity code; LLM semantic analysis for high-complexity code.
- Enforced “determinism decides”: LLM findings require verifiable proof before becoming actionable.
- CWE classification outputs strict structured JSON: CWE ID + confidence; schema-validated; fail-closed on invalid/uncertain outputs.
- Autonomous remediation uses a bounded loop (generate → review → verify) and discards patches if gates fail (fail-closed).
- Deterministic verification gates include: build/compile, tests, re-run detector/regression checks, minimal-diff enforcement, and semantic preservation checks.
- Remediation governance uses lane routing (L1–L4) driven by a multi-dimensional complexity vector (context depth, test coverage, blast radius, dataflow complexity).
- Prioritization uses multi-source intelligence fusion (severity + exploitability + real-world risk signals) with auditable scoring/traceability.
- Data layer uses BigQuery + dbt Medallion (Bronze/Silver/Gold) with dedupe/curation and AI-training-quality filtering.
- Uses graph-based concepts for hotspot identification and prioritizing fixes for maximum risk reduction.
- High-level stack: Go services, k3s/Kubernetes, Cloudflare edge (WAF/CDN), Cloud Run + caching, model endpoints for classification/remediation, structured JSON contracts.
