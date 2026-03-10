import React, { useState, useEffect, useRef } from 'react';

// --- NEW TYPEWRITER COMPONENT (V2 Theme Matched) ---
const TypewriterText = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                setIsTyping(false);
            }
        }, 15); // Fast, snappy typing speed

        return () => clearInterval(timer);
    }, [text]);

    return (
        <span className="whitespace-pre-wrap">
            {displayedText}
            {isTyping && (
                <span className="inline-block w-[2px] h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
            )}
        </span>
    );
};
// ---------------------------------------------------

// --- ARCHITECTURE DIAGRAM COMPONENT ---
const ArchitectureDiagram = () => (
    <div className="w-full mt-4 bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
        <svg className="w-8 h-8 text-blue-400 mb-3 opacity-70 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-sm text-slate-300 font-mono tracking-widest text-center">
            [ INTERACTIVE ARCHITECTURE DIAGRAM ]
        </span>
        <p className="text-xs text-slate-500 mt-2 text-center max-w-[200px]">
            Visual representation of Zero Trust & AppSec infrastructure.
        </p>
    </div>
);
// --------------------------------------

export default function App() {
    const [memory, setMemory] = useState(null);

    // Load chat history from Local Storage
    const [messages, setMessages] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jq_chat_history');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Strip the 'isNew' flag from history so old messages load instantly
                    return parsed.map((m) => ({ ...m, isNew: false }));
                } catch {
                    // fallback
                }
            }
        }
        return [
            { role: 'assistant', content: "Hello! I'm Jeremy's AI assistant. How can I help you today?", isNew: false }
        ];
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Manage persistent User UUID for Analytics
    useEffect(() => {
        const stored = localStorage.getItem('jq_visitor');
        if (stored) {
            try {
                setMemory(JSON.parse(stored));
                return;
            } catch {
                // corrupted — fall through to create fresh
            }
        }
        const newMemory = {
            uuid: crypto.randomUUID(),
            firstVisit: new Date().toISOString(),
            lastActiveSection: null
        };
        localStorage.setItem('jq_visitor', JSON.stringify(newMemory));
        setMemory(newMemory);
    }, []);

    // Save messages to Local Storage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('jq_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    // Robust Auto-Scroll: Triggers smoothly
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (text) => {
        const userMsg = typeof text === 'string' ? text : input;
        if (!userMsg.trim()) return;

        // User messages never get the typewriter effect
        setMessages(prev => [...prev, { role: 'user', content: userMsg, isNew: false }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, uuid: memory?.uuid })
            });
            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply,
                action: data.action,
                codeSnippet: data.codeSnippet,
                suggested: data.suggested,
                isNew: true // Trigger typewriter ONLY for new replies
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm currently unable to reach the server. Please try again in a moment.",
                isNew: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Clear Chat Function
    const clearChat = () => {
        setMessages([{ role: 'assistant', content: "Hello! I'm Jeremy's AI assistant. How can I help you today?", isNew: false }]);
        localStorage.removeItem('jq_chat_history');
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">

            {/* Premium Header */}
            <header className="shrink-0 sticky top-0 z-10 px-6 py-4 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-sm tracking-wider">JQ</span>
                        </div>
                        <h1 className="text-lg font-semibold tracking-tight text-slate-200">
                            Architectural Authority
                        </h1>
                    </div>

                    {/* V2 Clear Button */}
                    {messages.length > 1 && (
                        <button
                            onClick={clearChat}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-800 transition-all"
                        >
                            Clear Chat
                        </button>
                    )}
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth relative">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 pb-32">
                    {messages.map((msg, i) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div
                                key={i}
                                className={`flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Assistant Avatar */}
                                    {!isUser && (
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mt-1 shadow-sm">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`
                    p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed min-w-[200px]
                    ${isUser
                                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-tr-sm shadow-blue-900/20'
                                            : 'bg-slate-800/80 backdrop-blur-md text-slate-200 rounded-tl-sm border border-slate-700/50 shadow-black/20'}
                  `}>

                                        {/* The Typewriter Injection */}
                                        {!isUser && msg.isNew ? (
                                            <TypewriterText text={msg.content} />
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}

                                        {/* Action Components */}
                                        {msg.action === 'SHOW_CV' && (
                                            <a
                                                href="/Jeremy_Quadri_CV.pdf"
                                                download="Jeremy_Quadri_CV.pdf"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-500/20 transition-all duration-200 text-sm font-semibold tracking-wide"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                Download CV (PDF)
                                            </a>
                                        )}

                                        {msg.action === 'SHOW_CALENDAR' && (
                                            <a
                                                href="https://calendar.app.google/c2YP1NDU8cGZieqv9"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-5 py-2.5 rounded-xl border border-blue-500/20 transition-all duration-200 text-sm font-semibold tracking-wide"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Book Strategy Call
                                            </a>
                                        )}

                                        {msg.action === 'RENDER_CODE' && msg.codeSnippet && (
                                            <pre className="mt-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-[13px] font-mono text-slate-300 overflow-x-auto">
                                                <code>{msg.codeSnippet.content}</code>
                                            </pre>
                                        )}

                                        {msg.action === 'RENDER_SVG' && (
                                            <ArchitectureDiagram />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Elegant Loading State */}
                    {loading && (
                        <div className="flex justify-start w-full animate-in fade-in duration-300">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mt-1">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                </div>
                                <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl rounded-tl-sm border border-slate-700/50 flex items-center h-[52px]">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </main>

            {/* Floating Input Area */}
            <footer className="shrink-0 sticky bottom-0 z-10 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
                <div className="max-w-4xl mx-auto space-y-4">

                    {/* Suggested Questions */}
                    {!loading && messages[messages.length - 1]?.suggested && (
                        <div className="flex flex-wrap gap-2 justify-center mb-2 px-2">
                            {messages[messages.length - 1].suggested.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="text-[13px] bg-slate-800/60 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full border border-slate-700/60 transition-all hover:border-slate-500 shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Premium Input Field */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative flex items-center group shadow-xl shadow-black/20 rounded-2xl"
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message Jeremy's assistant..."
                            className="w-full bg-slate-800/90 backdrop-blur-xl text-slate-100 placeholder-slate-400 pl-5 pr-14 py-4 rounded-2xl border border-slate-700/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-[15px]"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 p-2.5 text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-700/50"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>

                </div>
            </footer>
        </div>
    );
}