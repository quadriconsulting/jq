import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Shield, Brain, Lock, Mail, MessageSquare, Send, X } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// --- SUB-COMPONENTS ---

const TypewriterMessage = ({ text, containerRef }: { text: string; containerRef?: React.RefObject<HTMLDivElement | null> }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;

      if (containerRef?.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }

      if (i >= text.length) clearInterval(interval);
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

  // Updated Scroll Logic for React 19
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not reach agent." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 glass border border-champagne/30 rounded-full p-5 text-champagne shadow-2xl">
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div ref={panelRef} className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-50 md:w-96 h-[70vh] md:h-[600px] glass border border-champagne/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-white">
          <div className="p-4 border-b border-champagne/20 flex justify-between items-center bg-white/5">
            <h3 className="font-semibold text-champagne">Jeremy's AI</h3>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1 && msg.role === 'assistant';
              return (
                <div key={idx} className={`p-3 rounded-xl max-w-[90%] ${msg.role === 'user' ? 'bg-champagne text-obsidian ml-auto' : 'bg-white/10 mr-auto'}`}>
                  {isLast ? <TypewriterMessage text={msg.content} containerRef={scrollRef} /> : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                </div>
              );
            })}
            {loading && <div className="text-xs text-champagne/50 animate-pulse">Thinking...</div>}
          </div>

          <div className="p-4 bg-white/5 border-t border-champagne/20 flex gap-2">
            <input 
              className="flex-1 bg-obsidian/50 border border-white/10 rounded-full px-4 py-2 text-sm outline-none"
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask me anything..."
            />
            <button onClick={() => sendMessage(input)} className="bg-champagne text-obsidian rounded-full p-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const App = () => (
  <div className="relative">
    <Navbar />
    <Hero />
    {/* Add Features, Philosophy etc components here */}
    <AIConcierge />
  </div>
)

export default App
