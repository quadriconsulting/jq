// Author: Jeremy Quadri
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const Philosophy = () => {
  const philoRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.philo-text', {
        scrollTrigger: {
          trigger: philoRef.current,
          start: 'top 60%',
          scrub: 1
        },
        y: 100,
        opacity: 0
      })
    }, philoRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="philosophy"
      ref={philoRef}
      className="relative py-40 px-6 overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80&fm=jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-obsidian/85"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="philo-text">
          <p className="text-3xl md:text-5xl font-serif font-bold text-gray-300 mb-6 leading-tight">
            Beyond compliance.
          </p>
          <p className="text-3xl md:text-5xl font-serif font-bold text-champagne leading-tight">
            I build risk-intelligent security systems enforced by architecture.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Philosophy
