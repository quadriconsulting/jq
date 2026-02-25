# Security Automation Platform (Skills & Capabilities)

## Highlights
- Architected an all-in-one AppSec platform spanning SAST, SCA, DAST, secrets detection, SBOM, IaC scanning, mobile security, malware detection, and unified vulnerability management.
- Built CCN-aware hybrid SAST routing: deterministic scanning for low-complexity code and LLM semantic analysis for high-complexity logic.
- Implemented safe autonomous remediation with multi-agent review and deterministic verification gates (build/tests, re-run detector, minimal diff, semantic preservation) using fail-closed policies.
- Delivered strict JSON-based CWE classification with confidence scoring and guardrails (schema validation + fail-closed on uncertainty).
- Designed lane-based remediation governance (L1–L4) driven by a multi-dimensional complexity vector (context depth, test coverage, blast radius, dataflow complexity).
- Implemented multi-source threat intelligence fusion and an auditable risk prioritization engine, backed by BigQuery + dbt Medallion (Bronze/Silver/Gold) with dedupe/curation and AI-training-quality filtering.

## Stack (high level)
Go (routing/services), k3s/Kubernetes, Cloudflare edge (WAF/CDN), BigQuery + dbt (medallion), Cloud Run + caching, LLM endpoints for classification/remediation, structured JSON contracts.
