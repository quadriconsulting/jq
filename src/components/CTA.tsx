// Author: Jeremy Quadri
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Mail } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const CTA = () => {
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 70%'
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
    }, ctaRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" ref={ctaRef} className="py-40 px-6 bg-obsidianLight">
      <div className="max-w-4xl mx-auto text-center cta-content">
        <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8">
          Let's Build Something <span className="text-champagne">Unbreakable</span>
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          If you need vulnerability intelligence architecture, AI-assisted remediation workflows with deterministic safeguards, or enterprise-scale secure system design — let's start the conversation.
        </p>
        <a
          href="mailto:jeremy@quadri.fit"
          className="inline-flex items-center gap-3 magnetic-btn bg-champagne text-obsidian px-12 py-6 rounded-full text-lg font-semibold hover:bg-yellow-300 transition-colors"
        >
          <Mail className="w-5 h-5" />
          jeremy@quadri.fit
        </a>
      </div>
    </section>
  )
}

export default CTA
