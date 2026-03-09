// Author: Jeremy Quadri
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Shield, Brain, Lock } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Application Security Architecture",
      description: "Design and operationalisation of secure SDLC and enterprise AppSec programs across SAST, SCA, DAST, IaC and secrets detection — embedded directly into CI/CD to reduce vulnerability backlog and accelerate remediation cycles.",
      focuses: [
        "Secure SDLC + CI/CD enforcement",
        "Vulnerability lifecycle governance",
        "Risk-based prioritisation aligned to business impact"
      ]
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Vulnerability Intelligence & Risk Scoring",
      description: "Architect multi-source vulnerability intelligence pipelines (NVD, GHSA, OSV, MITRE, CISA KEV, EPSS, ExploitDB) with deduplication, enrichment, and composite risk scoring that blends EPSS, CVSS, KEV presence and exploit signals into an actionable remediation queue.",
      focuses: [
        "Data ingestion + deduplication at scale",
        "EPSS/CVSS/KEV enrichment and correlation",
        "Actionable risk scoring and prioritised remediation"
      ]
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "AI-Augmented Security Automation",
      description: "Build AI-assisted remediation workflows where generated fixes are reviewed and validated through deterministic quality gates before merge — reducing engineering toil without compromising security integrity.",
      focuses: [
        "Bounded LLM generation + review loops",
        "Deterministic validation and guardrails",
        "GitHub workflow enforcement before merge"
      ]
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: "Cloud & Infrastructure Security Engineering",
      description: "Design and implement secure cloud architectures using Zero Trust principles, least-privilege access, and structured telemetry across cloud and container environments.",
      focuses: [
        "Zero Trust access architecture",
        "RBAC and tenant isolation",
        "Observability, detection and incident readiness"
      ]
    }
  ]

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.feature-card').forEach((card: any, index) => {
        gsap.fromTo(card,
          {
            y: 80,
            opacity: 0
          },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 60%',
              toggleActions: 'play none none none'
            },
            y: 0,
            opacity: 1,
            duration: 1,
            delay: index * 0.1,
            ease: 'power3.out'
          }
        )
      })
    }, featuresRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="services" ref={featuresRef} className="py-32 px-6 bg-obsidianLight">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-center mb-20">
          <span className="text-gradient">Core Capabilities</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="feature-card glass p-10 rounded-2xl border-2 border-champagne/30 hover:border-champagne/60 transition-all group relative"
              style={{ minHeight: '450px' }}
            >
              <div className="text-champagne mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed mb-6">{feature.description}</p>

              <div className="border-t border-champagne/20 pt-6 mt-4">
                <h4 className="text-sm uppercase tracking-wider text-champagne mb-3 font-semibold">Focus Areas</h4>
                <ul className="space-y-2">
                  {feature.focuses.map((focus, focusIdx) => (
                    <li key={focusIdx} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-champagne mt-0.5">•</span>
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
