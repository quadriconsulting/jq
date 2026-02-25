# Jeremy “Jay” Quadri — CV Q&A (Canonical, RAG-Optimized)

> Purpose: stable, “canonical” answers for common recruiter / hiring manager questions.
> Use: retrieve these Q&A blocks first when the user asks a matching question.
> Notes: keep answers factual; avoid embellishment; prefer crisp bullets.

---

## Profile & Positioning

### Q: Who are you professionally, in one paragraph?
A: I’m an Application Security / Security Testing Lead with ~20 years of experience across regulated environments (notably financial services). I focus on advanced web/mobile/API penetration testing, WAF/edge security validation, DevSecOps security automation, and cryptography/PKI/HSM and certificate lifecycle management. I’m used to working closely with developers and stakeholders to prioritize remediation, improve security controls, and communicate risk clearly.

### Q: What kinds of roles do you fit best?
A:
- Application Security Engineer / Lead
- Penetration Tester / Security Test Lead
- WAF / Edge Security Consultant
- DevSecOps Security Engineer (security automation + CI/CD integration)
- Security Architect (AppSec / edge controls / crypto lifecycle focus)

### Q: What industries have you worked in?
A:
- Financial services / banking (e.g., Deutsche Bank, RBS Global Markets, BNP Paribas Fortis, HSBC)
- Insurance (AXA)
- Consulting / multi-client delivery (Quadri Consulting)
- Enterprise services (NTT Data)
- Background screening / HR tech (HireRight)
- Government program testing (BT Operate)

---

## Core Strengths

### Q: What are your strongest technical areas?
A:
- Application pentesting (web/mobile/API), manual + automated
- WAF/edge validation (F5, Akamai, Cloudflare) with exploit-driven testing
- CI/CD security integration for continuous security testing
- Threat modeling and targeted security scenarios
- Crypto/PKI/HSM: TLS, OpenSSL, cert/key lifecycle, HSM-backed key management
- Vulnerability management and security reporting (OWASP Top 10, SANS Top 25)

### Q: What’s your approach to penetration testing?
A:
- Start with scoping, threat modeling, and environment understanding
- Use automated tooling for coverage, then manual testing for depth
- Reproduce and validate issues with realistic exploitation (where safe/authorized)
- Produce actionable remediation guidance (code/config changes)
- Re-test to confirm fixes and validate controls (including WAF rules where applicable)

### Q: What’s your approach to WAF validation?
A:
- Build a baseline policy aligned to the app’s behavior and risk profile
- Validate coverage using exploit-driven tests (SQLi, XSS, CSRF, auth bypass, etc.)
- Tune to reduce false positives while maintaining protection
- Measure efficacy with repeatable test cases and regression checks
- Document rule changes and provide stakeholder-ready reporting

---

## WAF / Edge Security Experience

### Q: Which WAF platforms have you worked with?
A:
- F5 ASM / LTM (and related F5 components)
- Akamai Layer 7 WAF
- Cloudflare WAF / edge controls
- ModSecurity (and related rule tuning)

### Q: What WAF work did you do at AXA?
A:
- Configured, deployed, and maintained F5 Web Application Firewall
- Produced reporting/alerting and senior-management level visibility
- Automated security workflows using Python/Bash
- Supported vulnerability remediation based on testing findings

### Q: What WAF work did you do at HSBC?
A:
- Deployed layer-7 WAF protections using Akamai for critical web services
- Produced high-level and low-level designs
- Implemented bot protections and supported vulnerability remediation/validation

### Q: What WAF work did you do at RBS Global Markets?
A:
- Implemented F5 ASM policies and IP intelligence for a global e-commerce security program
- Supported certificate/key management and SDLC integration
- Built certificate expiry notification automation
- Led deployment of 26 WAF appliances globally and developed baseline QA/production policies
- Supported HSM integration (Thales) and resilient traffic management

---

## DevSecOps / Automation

### Q: Have you integrated security testing into CI/CD?
A: Yes. At NTT Data I embed penetration testing activities into CI/CD workflows to support continuous security validation and faster feedback loops for developers.

### Q: What automation have you built or led?
A:
- Automated security testing processes for repeatability and scale
- Automated security tool management and operational workflows (Python/Bash)
- Built detection/response automation using Azure Sentinel plus scripts to simulate attacker behaviors and improve response

---

## Cloud & Platform Experience

### Q: Which cloud platforms do you have experience with?
A:
- AWS
- Azure
- Google Cloud Platform (GCP)

### Q: Do you have container and Kubernetes experience?
A: Yes — Kubernetes and Docker experience, plus platforms/tools such as Rancher and Proxmox in lab/virtualized environments.

---

## Threat Modeling, Detection, and Zero Trust

### Q: Do you do threat modeling?
A: Yes — I perform threat modeling and targeted pentest scenarios to identify likely attack paths and validate controls.

### Q: Any Zero Trust work?
A: Yes — I’ve implemented/validated Zero Trust architectures by running adversarial simulations against WAF/CDN/IAM controls and validating defensive posture.

### Q: Any SIEM / monitoring experience?
A:
- Azure Sentinel (Microsoft Sentinel) for automation/detection workflows
- Splunk and ArcSight exposure
- Centralized event collection using Syslog-ng (e.g., at BNP Paribas Fortis)

---

## Crypto / PKI / HSM

### Q: What is your cryptography / PKI experience?
A:
- TLS and certificate/key lifecycle management (OpenSSL, PKI)
- Program delivery for encryption in transit/at rest
- HSM integration and key management strategy (tokenization and encryption workflows)
- Certificate automation (including expiry notification and management automation)

### Q: What did you do at Deutsche Bank related to crypto?
A:
- Led security initiatives focused on encryption, audits, risk mitigation, and key/cert lifecycle management
- Coordinated a distributed team (~25 across multiple locations)
- Built PoCs/test labs to validate approaches
- Delivered HSM integration and key management strategy; supported large-scale programs including a complex database encryption project

---

## Vulnerability Management & Secure SDLC

### Q: What frameworks/baselines do you use?
A:
- OWASP Top 10
- SANS Top 25
- OWASP ASVS for verification standards
- PTES-aligned testing (on relevant engagements)
- Compliance frameworks used in context: ISO 27001, NIST, OSSTMM, GDPR (as required by client/program)

### Q: What did you do at HireRight related to SDLC security?
A:
- Ran app security activities across SDLC, including DAST/SAST baselines (Qualys, SonarQube)
- Operated a threat & vulnerability management framework and weekly vulnerability-focused code review
- Owned PingFederate (SAML) and supported cloud migration (GCP/AWS/Azure)
- Supported PKI and infrastructure security (LDAP, OpenSSL, ModSecurity)

---

## Leadership & Delivery

### Q: Have you led teams?
A:
- NTT Data: led DevSecOps pentest team; mentored engineers; drove automation and best practices
- Deutsche Bank: coordinated a geographically dispersed team (~25 across regions)
- Co-operative Group: led a 15-person team delivering an application security programme

### Q: What’s an example of large program delivery?
A:
- Deutsche Bank: planned/led cybersecurity programs totaling £40M+ and delivered a complex database encryption project with global impact.

### Q: How do you communicate risk to stakeholders?
A:
- Provide clear, prioritized findings with severity, exploitability context, and concrete remediation steps
- Translate technical detail into business impact and risk language
- Support re-testing and closure tracking to confirm issues are resolved

---

## Penetration Testing & Consulting Highlights

### Q: What kinds of pentest engagements have you done?
A:
- Web applications, mobile applications, and APIs
- PTES-aligned engagement delivery (where applicable)
- Security assessments including phishing, password auditing/cracking (authorized), and control validation
- Network testing components in certain programs (VPN/Wi-Fi, scanning, etc.)

### Q: What did you do at Quadri Consulting?
A:
- Delivered consulting on customer data handling weaknesses and security posture
- Conducted penetration testing, policy/OS security reviews, and compliance support
- Representative work included: static code analysis enablement, PTES-aligned pentesting, PCI DSS readiness work, DLP classification projects, and application code security and encryption/certificate work

---

## Education & Certifications

### Q: What is your education?
A:
- BEng (Hons), Electrical & Electronic Engineering — London South Bank University (1992)
- German Language Diploma — Hochschule University, Bremen (1991)

### Q: What certifications/training are listed?
A:
- TOGAF certification preparation (2013)
- ISC2 CISSP (2013)
- VMware vSphere (2013)
- CompTIA Security+ SY0-301 (2012)
- InfoSec Institute Web Application Security Certified (2007)
- OWASP: Testing Secure Web Applications (2007)
- OSCP (2007)
- CEH (2007)

---

## Quick “Recruiter” Short Answers

### Q: Can you summarize your recent role at NTT Data?
A: Security Test Lead/Architect performing advanced app pentesting (web/mobile/API), embedding testing into CI/CD, designing and validating WAF controls in AWS/Azure with exploit-driven tests, automating security workflows, leading a DevSecOps pentest team, and communicating findings and remediation guidance to stakeholders.

### Q: Are you more offensive, defensive, or hybrid?
A: Hybrid — strong offensive testing (pentest/exploitation) combined with defensive validation (WAF/edge controls, detection automation, secure SDLC enablement).

### Q: What makes you stand out?
A: Depth across pentesting + WAF validation + DevSecOps automation + crypto/PKI/HSM programs, combined with leadership experience delivering in regulated enterprises.
