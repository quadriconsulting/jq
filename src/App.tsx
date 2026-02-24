import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Shield, Brain, Lock, Mail, MessageSquare, Send, X } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// Navbar Component
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      scrolled ? 'glass py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="text-xl font-serif font-bold text-champagne">JQ</div>
        <div className="flex gap-8 text-sm">
          <a href="#services" className="hover:text-champagne transition-colors">Services</a>
          <a href="#philosophy" className="hover:text-champagne transition-colors">Philosophy</a>
          <a href="#contact" className="hover:text-champagne transition-colors">Contact</a>
        </div>
      </div>
    </nav>
  )
}

// Hero Component
const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Entrance animations
      gsap.from('.hero-title-word', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power4.out'
      })
      
      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.8,
        ease: 'power3.out'
      })
      
      gsap.from('.hero-cta', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: 1.3,
        ease: 'back.out(1.7)'
      })
      
      // Subtle background parallax (accessibility-aware)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!prefersReducedMotion && heroBgRef.current) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches
        const maxY = isMobile ? 6 : 12
        
        gsap.to(heroBgRef.current, {
          y: -maxY,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.4,
            invalidateOnRefresh: true
          }
        })
      }
    }, heroRef)
    
    return () => ctx.revert()
  }, [])
  
  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layer with subtle parallax */}
      <div 
        ref={heroBgRef}
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80&fm=jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
          pointerEvents: 'none'
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/80 to-obsidian"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight">
          <span className="hero-title-word inline-block">Jeremy</span>{' '}
          <span className="hero-title-word inline-block text-champagne">Quadri</span>
        </h1>
        
        <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Application Security Architect & AI-Driven Risk Systems Builder
        </p>
        
        <a 
          href="#contact" 
          className="hero-cta inline-block magnetic-btn bg-champagne text-obsidian px-12 py-5 rounded-full text-lg font-semibold hover:bg-yellow-300 transition-colors"
        >
          Start a Conversation
        </a>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-champagne rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-champagne rounded-full"></div>
        </div>
      </div>
    </section>
  )
}

// Features Component
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

// Philosophy Component
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

// Protocol Component (Stacking Cards)
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
      title: "Secure Architecture Implementation",
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

// CTA Component
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

// Footer Component
const Footer = () => {
  return (
    <footer className="relative bg-obsidian rounded-t-[4rem] py-16 px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="text-3xl font-serif font-bold text-champagne mb-4">JQ</div>
            <p className="text-gray-500 text-sm">
              Application Security Architect & AI-Driven Risk Systems Builder
            </p>
          </div>
          
          <div>
            <h4 className="text-champagne font-semibold mb-4">Navigation</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="#services" className="block hover:text-champagne transition-colors">Services</a>
              <a href="#philosophy" className="block hover:text-champagne transition-colors">Philosophy</a>
              <a href="#contact" className="block hover:text-champagne transition-colors">Contact</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-champagne font-semibold mb-4">Connect</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="mailto:jeremy@quadri.fit" className="block hover:text-champagne transition-colors">Email</a>
              <a href="https://www.linkedin.com/in/jquadri/" className="block hover:text-champagne transition-colors">LinkedIn</a>
              <a href="https://x.com/jquadri" className="block hover:text-champagne transition-colors">X (Twitter)</a>
              <a href="https://github.com/quadriconsulting" className="block hover:text-champagne transition-colors">GitHub</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-600">
          <p>© 2026 Jeremy Quadri. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// Ask about Jeremy's work Component
const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  
  const suggestedQuestions = [
    "How do you integrate NVD/EPSS/KEV into risk scoring?",
    "What AI techniques do you use for security automation?",
    "How do you approach Zero Trust architecture?",
    "What's your experience with SAST/DAST integration?"
  ]
  
  const sendMessage = async (text: string) => {
    const userMessage = { role: 'user' as const, content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setOffline(false)
    
    try {
      const res = await fetch('./api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      
      if (!res.ok) throw new Error('bad status')
      
      const data = await res.json()
      if (!data.reply) throw new Error('missing reply')
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setOffline(true)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Assistant is offline. Please email jeremy@quadri.fit directly to start a conversation about your security architecture needs."
      }])
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 magnetic-btn glass border border-champagne/30 rounded-full p-5 hover:border-champagne/60 transition-all shadow-2xl"
        >
          <MessageSquare className="w-6 h-6 text-champagne" />
        </button>
      )}
      
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-96 h-[600px] glass border border-champagne/30 rounded-3xl flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-champagne/20 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Ask about Jeremy's work</h3>
              <p className="text-xs text-gray-500">Ask about AppSec, risk scoring, and automation.</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:text-champagne transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">Try asking:</p>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-sm p-3 rounded-lg border border-champagne/20 hover:border-champagne/50 hover:bg-champagne/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-champagne text-obsidian ml-8' 
                    : 'bg-obsidianLight mr-8'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 p-4 rounded-2xl bg-obsidianLight mr-8">
                <div className="w-2 h-2 bg-champagne rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-champagne rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-champagne rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-champagne/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && input.trim() && sendMessage(input)}
                placeholder="Ask a question..."
                className="flex-1 bg-obsidianLight rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-champagne/50"
                disabled={loading}
              />
              <button
                onClick={() => input.trim() && sendMessage(input)}
                disabled={loading || !input.trim()}
                className="magnetic-btn bg-champagne text-obsidian rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Main App Component
const App = () => {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <CTA />
      <Footer />
      <AIConcierge />
    </div>
  )
}

export default App
