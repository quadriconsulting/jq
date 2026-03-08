// Ask about Jeremy's work Component
const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How do you integrate NVD/EPSS/KEV into risk scoring?",
    "What AI techniques do you use for security automation?",
    "How do you approach Zero Trust architecture?",
    "What's your experience with SAST/DAST integration?"
  ];

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(panelRef.current, 
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      const timeoutId = setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100); 
      return () => clearTimeout(timeoutId);
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const userMessage = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setOffline(false);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setOffline(true);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Assistant is offline. Please email jeremy@quadri.fit directly."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 magnetic-btn glass border border-champagne/30 rounded-full p-5 hover:border-champagne/60 transition-all shadow-2xl"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-champagne" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-obsidian rounded-full animate-pulse"></span>
          </div>
        </button>
      )}
      
      {isOpen && (
        <div 
          ref={panelRef} 
          className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-50 md:w-96 h-[75vh] md:h-[600px] glass border border-champagne/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-champagne/20 flex justify-between items-center bg-white/5 backdrop-blur-md">
            <div>
              <h3 className="font-semibold text-lg text-champagne">Ask Jeremy's AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-gray-400">Context-Aware RAG Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-champagne transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth custom-scrollbar">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">How can I help you today?</p>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-sm p-3 rounded-xl border border-champagne/10 hover:border-champagne/40 hover:bg-champagne/5 transition-all text-gray-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, idx) => {
              const isLastAssistantMessage = idx === messages.length - 1 && msg.role === 'assistant';
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-champagne text-obsidian ml-auto rounded-tr-none shadow-lg' 
                      : 'bg-white/5 border border-white/10 mr-auto rounded-tl-none'
                  }`}
                >
                  {isLastAssistantMessage ? (
                    <TypewriterMessage text={msg.content} containerRef={scrollRef} />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-4 text-xs text-champagne/60 italic">
                <Brain className="w-3 h-3 animate-spin" />
                Analyzing security context...
              </div>
            )}
          </div>
          
          {/* Input - NOW PROPERLY OUTSIDE THE MESSAGES LOOP */}
          <div className="p-4 bg-white/5 border-t border-champagne/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && input.trim() && sendMessage(input)}
                placeholder="Type your message..."
                className="flex-1 bg-obsidian/50 border border-white/10 rounded-full px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-champagne/50"
                disabled={loading}
              />
              <button
                onClick={() => input.trim() && sendMessage(input)}
                disabled={loading || !input.trim()}
                className="magnetic-btn bg-champagne text-obsidian rounded-full p-3 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
