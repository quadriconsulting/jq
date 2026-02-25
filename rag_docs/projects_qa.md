# Projects Q&A — Security Automation Platform

> Canonical Q&A for recruiter/hiring-manager questions about the security automation platform project.
> Keep answers factual, concise, and skills-focused.

---

### Q: What did you build?
A: A developer-focused application security platform that unifies multiple security capabilities in one workflow:
- SAST, SCA, DAST, secrets detection, SBOM, IaC scanning, mobile analysis, malware checks
- Centralized vulnerability management, prioritization, and reporting
- Automation policies aligned to CI/CD pipelines

### Q: What’s unique about your SAST approach?
A:
- Hybrid routing: deterministic scanning for low-complexity code and deeper LLM semantic analysis for high-complexity logic
- CCN/complexity-aware decisions to balance speed, coverage, and precision
- Results require corroboration before becoming actionable

### Q: How do you prevent hallucinated findings from the LLM?
A:
- “Determinism decides”: LLM outputs are not accepted without verifiable evidence
- Fail-closed defaults: uncertain or invalid outputs are discarded
- Structured JSON contracts + schema validation to prevent malformed outputs

### Q: Did you implement auto-fix? How is it made safe?
A:
- Yes, via a bounded remediation loop (generate → review → verify)
- Deterministic verification gates are the approval authority (build/tests, re-run detector, minimal diff, semantic preservation)
- If gates fail or consensus isn’t reached within policy limits, the patch is discarded (fail-closed)

### Q: How do you classify CWEs?
A:
- CWE classification uses strict structured JSON output (CWE ID + confidence)
- Guardrails enforce schema validity and fail-closed behavior on uncertainty
- Classification and remediation are separated so misclassification doesn’t auto-approve changes

### Q: What is your remediation governance model?
A:
- Lane-based routing (L1–L4) driven by a multi-dimensional complexity vector (context depth, test coverage, blast radius, dataflow complexity)
- Conservative routing when signals are missing
- Bounded iterations to control cost and risk

### Q: How do you prioritize vulnerabilities?
A:
- Multi-source intelligence fusion (severity + exploitability + real-world risk signals)
- Auditable scoring rules and traceability from input signals to final priority
- Graph-based concepts to identify hotspots and maximize risk reduction per fix

### Q: What was your role?
A:
- Architected the system and key invariants (routing, safety gates, fail-closed policies)
- Implemented core platform components and data pipeline foundations
- Defined operational guardrails for reliability, cost control, and safe automation

### Q: What’s the tech stack?
A:
- Services/routing: Go
- Runtime: k3s/Kubernetes
- Edge: Cloudflare (WAF/CDN)
- Data: BigQuery + dbt (medallion)
- Compute: Cloud Run + caching
- AI: model endpoints for classification/remediation with structured JSON outputs

### Q: What’s autonomous vs advice-only?
A:
- Autonomous actions (e.g., fixes) are allowed only when deterministic gates pass
- Otherwise the system falls back to guidance-only recommendations
- This prevents unsafe changes and keeps automation bounded

### Q: What are the key safety guarantees?
A:
- Fail-closed by default (no “best-effort” autopatching)
- Deterministic gates are the authority for approval
- Bounded iterations, minimal diff enforcement, and regression validation
