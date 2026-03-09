// Author: Jeremy Quadri
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const Protocol = () => {
  const protocolRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      number: "01",
      title: "Threat Intelligence Mapping",
      description: "Comprehensive vulnerability landscape analysis using NVD, EPSS, KEV and exploit correlation to identify exposure patterns, exploit probability, and attack surface concentration."
    },
    {
      number: "02",
      title: "AI-Driven Risk Prioritisation",
      description: "Composite risk scoring blends threat intelligence with environmental context to generate a remediation queue engineers can trust — reducing noise and focusing on exploit-relevant risk."
    },
    {
      number: "03",
      title: "Secure Architecture Delivery",
      description: "Implementation of Zero Trust controls, PKI and key management infrastructure, CI/CD security gates, and continuous SAST/DAST validation across the SDLC."
    },
    {
      number: "04",
      title: "Verification & Continuous Control",
      description: "Deterministic enforcement gates, telemetry feedback loops, and measurable remediation SLAs ensure security improvements are provable, repeatable, and sustained."
    }
  ]

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Responsive animation: pin stacking on desktop, simple reveal on mobile
      ScrollTrigger.matchMedia({
        // Desktop: keep stacking pin behavior
        "(min-width: 769px)": () => {
          steps.forEach((_, idx) => {
            ScrollTrigger.create({
              trigger: `.protocol-card-${idx}`,
              start: 'top 20%',
              end: 'bottom 20%',
              pin: true,
              pinSpacing: false
            })
          })
        },

        // Mobile: disable pinning, use simple reveal
        "(max-width: 768px)": () => {
          steps.forEach((_, idx) => {
            const card = `.protocol-card-${idx}`
            gsap.fromTo(
              card,
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power1.out",
                clearProps: "transform",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  toggleActions: "play none none none"
                }
              }
            )
          })
        }
      })
    }, protocolRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={protocolRef} className="relative py-32 px-6 bg-obsidian">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-center mb-32">
          <span className="text-gradient">Engagement Protocol</span>
        </h2>

        <div className="space-y-10 md:space-y-32">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`protocol-card-${idx} glass p-16 rounded-3xl border border-champagne/20 relative`}
              style={{ zIndex: 10 + idx }}
            >
              <div className="text-8xl font-serif font-bold text-champagne/20 mb-6">
                {step.number}
              </div>
              <h3 className="text-4xl font-semibold mb-6">{step.title}</h3>
              <p className="text-xl text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Protocol
