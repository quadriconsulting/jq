import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Shield, Brain, Lock, Mail, MessageSquare, Send, X } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// --- SUB-COMPONENTS ---

const TypewriterMessage = ({ 
  text, 
  containerRef 
}: { 
  text: string; 
  containerRef?: React.RefObject<HTMLDivElement> 
}) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const currentText = text.slice(0, i);
      setDisplayedText(currentText);

      if (containerRef?.current) {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        });
      }

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [text, containerRef]);

  return <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayedText}</p>;
};

// --- MAIN SECTIONS ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'glass py-4' : 'bg-transparent py-6'}`}>
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

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroBgRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    gsap.from('.hero-title-word', { y: 100, opacity: 0, duration: 1.2, stagger: 0.15, ease: 'power4.out' })
    gsap.from('.hero-subtitle', { y: 50, opacity: 0, duration: 1, delay: 0.8, ease: 'power3.out' })
    gsap.from('.hero-cta', { scale: 0.8, opacity: 0, duration: 0.8, delay: 1.3, ease: 'back.out(1.7)' })
  }, { scope: heroRef })

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div ref={heroBgRef} className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/80 to-obsidian"></div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight">
          <span className="hero-title-word inline-block">Jeremy</span> <span className="hero-title-word inline-block text-champagne">Quadri</span>
        </h1>
        <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">Application Security Architect & AI-Driven Risk Systems Builder</p>
        <a href="#contact" className="hero-cta inline-block magnetic-btn bg-champagne text-obsidian px-12 py-5 rounded-full text-lg font-semibold">Start a Conversation</a>
      </div>
    </section>
  )
}

// ... [Features, Philosophy, Protocol, CTA, Footer go here - keeping them as per your original code] ...

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Assistant offline. Please email jeremy@quadri.fit" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 magnetic-btn glass border border-champagne/30 rounded-full p-5 shadow-2xl text-champagne">
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
      {isOpen && (
        <div ref={panelRef} className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-50 md:w-96 h-[75vh] md:h-[600px] glass border border-champagne/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-champagne/20 flex justify-between items-center bg-white/5 backdrop-blur-md">
            <h3 className="font-semibold text-champagne">Ask Jeremy's AI</h3>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-champagne text-obsidian ml-auto rounded-tr-none' : 'bg-white/5 border border-white/10 mr-auto rounded-tl-none'}`}>
                {idx === messages.length - 1 && msg.role === 'assistant' ? <TypewriterMessage text={msg.content} containerRef={scrollRef} /> : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
              </div>
            ))}
            {loading && <div className="text-xs text-champagne/60 italic p-2"><Brain className="inline w-3 h-3 animate-spin mr-2" />Analyzing...</div>}
          </div>
          <div className="p-4 bg-white/5 border-t border-champagne/20 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)} placeholder="Type..." className="flex-1 bg-obsidian/50 border border-white/10 rounded-full px-4 py-2 outline-none" />
            <button onClick={() => sendMessage(input)} className="bg-champagne text-obsidian rounded-full p-3"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  )
}

const App = () => (
  <div className="relative">
    <Navbar />
    <Hero />
    {/* Add Features, Philosophy etc components here */}
    <AIConcierge />
  </div>
)

export default App
