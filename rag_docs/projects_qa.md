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

---

### Q: What makes your auto-fix safe enough to trust?
A:
- Every generated patch must pass a deterministic verification suite before merge: build integrity, re-run of the original detector, minimal-diff check, and semantic-preservation assertion.
- If any gate fails, the patch is discarded — not queued for manual review, discarded.
- The LLM proposes; the deterministic layer decides. Humans never see a patch unless it has already cleared all gates.

### Q: How do you prevent LLM hallucinations in security findings?
A:
- Findings require corroboration: the LLM output is cross-checked against a deterministic scanner result before it becomes actionable.
- Structured JSON contracts enforce schema validity; malformed or low-confidence outputs are discarded.
- "Determinism decides" is the governing principle — uncertain outputs default to advice-only, never auto-remediation.

### Q: How do you fuse EPSS/CVSS/KEV/exploit intel into one priority score?
A:
- Multi-signal fusion: CVSS base score provides severity floor; EPSS provides exploitation probability; KEV membership is a hard escalation flag; public exploit availability adds a further multiplier.
- Scores are auditable — each input signal is recorded alongside the final priority so decisions can be traced and challenged.
- Graph-based hotspot analysis identifies which vulnerabilities in the dependency graph maximise risk-reduction per fix.

### Q: How do you handle false positives and prove a finding is real?
A:
- Every finding carries a confidence band and the evidence chain (code path, taint trace, or pattern match) that produced it.
- Low-confidence findings are surfaced as advisory only and excluded from CI gates.
- Suppression rules require an owner and an expiry; they are reviewed in the same backlog as open findings.

### Q: How do you deduplicate multi-source vulnerability data?
A:
- Canonical vulnerability IDs (CVE/GHSA) are the primary key; scanner-specific IDs are mapped at ingest.
- Deduplication runs at the data pipeline layer (BigQuery + dbt) before results surface to the UI or scoring engine.
- Merge policy is conservative: when two sources disagree on severity, the higher severity is retained until a human resolves the conflict.

### Q: What is your CI/CD enforcement model (gates, policies, fail-closed)?
A:
- Security gates are policy-as-code: each gate has an explicit pass/fail rule, a severity threshold, and an owner.
- Default is fail-closed: a gate that cannot reach the policy engine blocks the build rather than defaulting to pass.
- Exceptions require a signed-off suppression record with a ticket reference and expiry — no silent bypasses.

### Q: How do you model remediation complexity and blast radius?
A:
- Complexity is a multi-dimensional vector: context depth, test coverage at the affected code path, dataflow complexity, and number of downstream consumers.
- Blast radius is computed from the dependency graph — a change to a shared utility scores higher than a change in an isolated leaf.
- High-complexity, high-blast-radius findings route to human review lanes (L3/L4); low-complexity findings proceed through automated lanes (L1/L2).

### Q: How do you design multi-tenant isolation and RBAC for AppSec platforms?
A:
- Tenant isolation is enforced at the data layer: each tenant's findings, suppression records, and audit logs are scoped by a tenant ID injected at ingest and validated on every read path.
- RBAC roles map to job functions: developer (read own projects), AppSec engineer (read all, write policy), admin (manage tenants and integrations).
- Privilege escalation requires approval-gated workflows, not direct role assignment.

### Q: How do you monitor and measure security outcomes (SLAs, MTTR, backlog burn-down)?
A:
- SLAs are set per severity tier (Critical: 7 days, High: 30 days) and tracked as a first-class metric alongside product delivery SLAs.
- MTTR and backlog burn-down are reported weekly to engineering leads and monthly to risk committees.
- A rising backlog in a stable codebase is treated as a process failure, not just technical debt.

### Q: What is your approach to SBOM and supply chain risk?
A:
- SBOMs are generated at build time (CycloneDX format) and stored as build artefacts, giving a point-in-time bill of materials for every release.
- Each component is mapped to its vulnerability feed (NVD/GHSA/OSV) continuously — a new CVE against an old release is surfaced automatically, not just at scan time.
- Ownership is assigned at the component level: the team that imported a dependency owns its vulnerability backlog, preventing the "nobody's problem" failure mode.
