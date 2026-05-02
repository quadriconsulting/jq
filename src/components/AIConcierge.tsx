// Author: Jeremy Quadri
import { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { MessageSquare, Send, X, Calendar, Download, Sparkles, Shield } from 'lucide-react'

// --- MERMAID RENDERER ---
mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryTextColor: '#000000',
        textColor: '#000000',
        primaryColor: '#F4E8D1',
        edgeLabelBackground: '#F4E8D1',
        lineColor: '#F4E8D1',
    },
    flowchart: {
        nodeSpacing: 60,
        rankSpacing: 90,
        curve: 'basis',
    },
})

let mermaidCounter = 0

const MermaidRenderer = ({ chart }: { chart: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const idRef = useRef(`mermaid-${++mermaidCounter}`)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        let cancelled = false
        mermaid.render(idRef.current, chart).then(({ svg }) => {
            if (!cancelled && el) el.innerHTML = svg
        }).catch(() => {
            if (!cancelled && el) {
                el.innerHTML = `<pre style="color:#F4E8D1;font-size:12px;overflow-x:auto;white-space:pre-wrap;">${chart}</pre>`
            }
        })
        return () => { cancelled = true }
    }, [chart])

    return (
        <div
            ref={containerRef}
            className="w-full mt-3 overflow-x-auto rounded-xl bg-[#111111]/60 border border-[#F4E8D1]/10 p-3"
        />
    )
}

// Split a reply string into alternating text and mermaid parts for rendering.
type ContentPart = { type: 'text'; text: string } | { type: 'mermaid'; chart: string }
function parseContent(content: string): ContentPart[] {
    const parts: ContentPart[] = []
    const re = /```mermaid\n?([\s\S]*?)```/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = re.exec(content)) !== null) {
        if (match.index > lastIndex) {
            const text = content.slice(lastIndex, match.index).trim()
            if (text) parts.push({ type: 'text', text })
        }
        parts.push({ type: 'mermaid', chart: match[1].trim() })
        lastIndex = re.lastIndex
    }
    const tail = content.slice(lastIndex).trim()
    if (tail) parts.push({ type: 'text', text: tail })
    return parts
}

// --- BESPOKE ARCHITECTURE DIAGRAM ---
const ArchitectureDiagram = () => (
    <div className="w-full mt-3 bg-[#111111]/60 backdrop-blur-md border border-[#F4E8D1]/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] shadow-inner">
        <div className="relative flex justify-center w-full">
            <div className="absolute inset-0 bg-[#F4E8D1] blur-xl opacity-10 rounded-full animate-pulse"></div>
            <Shield className="w-8 h-8 text-[#F4E8D1] mb-3 relative z-10 opacity-80" />
        </div>
        <span className="text-[11px] text-[#F4E8D1]/70 font-mono tracking-[0.2em] text-center uppercase block w-full">
            Zero Trust Architecture
        </span>
        <p className="text-[13px] text-gray-400 mt-2 text-center max-w-[200px] leading-relaxed mx-auto">
            Continuous verification & dynamic risk scoring.
        </p>
    </div>
);

// --- TYPEWRITER COMPONENT (Champagne Theme) ---
const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(true)

    useEffect(() => {
        let i = 0
        setDisplayedText('')
        setIsTyping(true)

        const timer = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1))
            i++
            if (i >= text.length) {
                clearInterval(timer)
                setIsTyping(false)
            }
        }, 15) // Snappy 15ms typing speed

        return () => clearInterval(timer)
    }, [text])

    return (
        <span className="whitespace-pre-wrap leading-relaxed tracking-wide">
            {displayedText}
            {isTyping && (
                <span className="inline-block w-[2px] h-[1.1em] ml-1 bg-[#F4E8D1] animate-pulse align-middle opacity-80" />
            )}
        </span>
    )
}

// --- INTERFACES ---
interface VisitorMemory {
    uuid: string
    firstVisit: string
    lastActiveSection: string | null
}

interface ChatResponse {
    reply: string
    suggested: string[]
    action?: 'SHOW_CV' | 'SHOW_CALENDAR' | 'RENDER_SVG' | 'RENDER_CODE'
    codeSnippet?: {
        language: string
        content: string
    }
}

interface Message {
    role: 'user' | 'assistant'
    content: string
    action?: ChatResponse['action']
    codeSnippet?: ChatResponse['codeSnippet']
    suggested?: string[]
    isNew?: boolean
}

const AIConcierge = () => {
    const [isOpen, setIsOpen] = useState(false)

    // Load chat history from local storage
    const [messages, setMessages] = useState<Array<Message>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jq_chat_history')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    return parsed.map((m: Message) => ({ ...m, isNew: false }))
                } catch {
                    return []
                }
            }
        }
        return []
    })

    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [memory, setMemory] = useState<VisitorMemory | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Manage persistent User UUID
    useEffect(() => {
        const stored = localStorage.getItem('jq_visitor')
        if (stored) {
            try {
                setMemory(JSON.parse(stored) as VisitorMemory)
                return
            } catch {
                // corrupted, let it create fresh
            }
        }
        const newMemory: VisitorMemory = {
            uuid: crypto.randomUUID(),
            firstVisit: new Date().toISOString(),
            lastActiveSection: null
        }
        localStorage.setItem('jq_visitor', JSON.stringify(newMemory))
        setMemory(newMemory)
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    // Save messages to local storage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('jq_chat_history', JSON.stringify(messages))
        }
    }, [messages])

    const defaultSuggestions = [
        "How do you integrate EPSS into risk scoring?",
        "What is your approach to Zero Trust?",
        "Tell me about your SAST/DAST experience."
    ]

    const sendMessage = async (text: string) => {
        const userMessage: Message = { role: 'user', content: text, isNew: false }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, uuid: memory?.uuid })
            })

            if (!res.ok) throw new Error('bad status')

            const data = await res.json() as ChatResponse
            if (!data.reply) throw new Error('missing reply')

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply,
                action: data.action,
                codeSnippet: data.codeSnippet,
                suggested: data.suggested,
                isNew: true
            }])
        } catch (e) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Assistant is offline. Please email jeremy@quadri.fit directly to start a conversation.",
                isNew: true
            }])
        } finally {
            setLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([])
        localStorage.removeItem('jq_chat_history')
    }

    return (
        <div className="font-sans antialiased text-[#F4E8D1]">
            {/* Premium Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#F4E8D1]/20 shadow-[0_8px_32px_rgba(244,232,209,0.15)] hover:shadow-[0_8px_32px_rgba(244,232,209,0.25)] hover:bg-[#111111] hover:border-[#F4E8D1]/40 transition-all duration-500 ease-out group"
                >
                    <MessageSquare className="w-6 h-6 text-[#F4E8D1] opacity-90 group-hover:opacity-100 transition-opacity" />
                </button>
            )}

            {/* Bespoke Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] z-50 h-[650px] max-h-[85vh] bg-[#050505]/85 backdrop-blur-2xl border border-[#F4E8D1]/10 rounded-3xl flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">

                    {/* Header */}
                    <div className="p-6 border-b border-[#F4E8D1]/10 flex justify-between items-start bg-gradient-to-b from-[#111111]/80 to-transparent">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#F4E8D1] animate-pulse shadow-[0_0_8px_rgba(244,232,209,0.8)]" />
                                <h3 className="font-semibold text-[16px] tracking-wide text-[#F4E8D1]">Jeremy's AI</h3>
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearChat}
                                        className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-[#F4E8D1]/20 text-[#F4E8D1]/50 hover:text-[#F4E8D1] hover:border-[#F4E8D1]/50 hover:bg-[#F4E8D1]/5 transition-all ml-2"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <p className="text-[12px] text-[#F4E8D1]/50 tracking-wide mt-1 ml-5">Authority in AppSec & Zero Trust.</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 text-[#F4E8D1]/40 hover:text-[#F4E8D1] rounded-full hover:bg-[#F4E8D1]/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="space-y-4 pt-4">
                                <p className="text-xs uppercase tracking-widest text-[#F4E8D1]/40 text-center font-medium">Inquire About</p>
                                <div className="flex flex-col gap-2">
                                    {defaultSuggestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(q)}
                                            className="text-left text-[13px] tracking-wide px-4 py-3.5 rounded-2xl border border-[#F4E8D1]/10 bg-[#111111]/40 hover:border-[#F4E8D1]/30 hover:bg-[#F4E8D1]/5 text-[#F4E8D1]/80 transition-all duration-300"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {msg.role === 'assistant' && (
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-[#111111] border border-[#F4E8D1]/20 flex items-center justify-center mt-1 shadow-lg">
                                            <Sparkles className="w-3.5 h-3.5 text-[#F4E8D1] opacity-80" />
                                        </div>
                                    )}

                                    <div className={`
                    p-4 text-[14px] shadow-lg min-w-[60px]
                    ${msg.role === 'user'
                                            ? 'bg-[#F4E8D1] text-[#050505] rounded-2xl rounded-tr-sm font-medium'
                                            : 'bg-[#111111]/60 backdrop-blur-md text-[#F4E8D1]/90 rounded-2xl rounded-tl-sm border border-[#F4E8D1]/10'}
                  `}>
                                        <div className="text-sm">
                                            {msg.role === 'assistant' ? (() => {
                                                const parts = parseContent(msg.content || '')
                                                if (parts.length === 1 && parts[0].type === 'text') {
                                                    // No mermaid — original rendering path, unchanged
                                                    return msg.isNew
                                                        ? <TypewriterText text={parts[0].text} />
                                                        : <span className="whitespace-pre-wrap leading-relaxed tracking-wide">{parts[0].text}</span>
                                                }
                                                return (
                                                    <>
                                                        {parts.map((part, i) =>
                                                            part.type === 'mermaid'
                                                                ? <MermaidRenderer key={i} chart={part.chart} />
                                                                : <span key={i} className="whitespace-pre-wrap leading-relaxed tracking-wide">{part.text}</span>
                                                        )}
                                                    </>
                                                )
                                            })() : (
                                                <span className="whitespace-pre-wrap leading-relaxed tracking-wide">{msg.content}</span>
                                            )}
                                        </div>

                                        {msg.action && (
                                            <div className="mt-4 flex flex-col gap-2">
                                                {msg.action === 'SHOW_CALENDAR' && (
                                                    <a
                                                        href="https://calendar.app.google/c2YP1NDU8cGZieqv9"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 w-full bg-[#F4E8D1]/10 hover:bg-[#F4E8D1]/20 text-[#F4E8D1] rounded-xl px-4 py-3 text-[13px] tracking-wide font-semibold border border-[#F4E8D1]/20 transition-all duration-300"
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                        Schedule Review
                                                    </a>
                                                )}

                                                {msg.action === 'SHOW_CV' && (
                                                    <a
                                                        href="/cv.pdf"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 w-full bg-[#F4E8D1]/5 hover:bg-[#F4E8D1]/15 text-[#F4E8D1]/80 rounded-xl px-4 py-3 text-[13px] tracking-wide font-semibold border border-[#F4E8D1]/10 transition-all duration-300"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download CV (PDF)
                                                    </a>
                                                )}

                                                {msg.action === 'RENDER_CODE' && msg.codeSnippet && (
                                                    <pre className="bg-[#050505]/80 border border-[#F4E8D1]/10 rounded-xl p-4 text-[12px] font-mono text-[#F4E8D1]/70 overflow-x-auto mt-2 shadow-inner">
                                                        <code>{msg.codeSnippet.content}</code>
                                                    </pre>
                                                )}

                                                {msg.action === 'RENDER_SVG' && (
                                                    <ArchitectureDiagram />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start w-full animate-in fade-in duration-500">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#111111] border border-[#F4E8D1]/20 flex items-center justify-center mt-1">
                                        <Sparkles className="w-3.5 h-3.5 text-[#F4E8D1]/30" />
                                    </div>
                                    <div className="bg-[#111111]/60 p-4 rounded-2xl rounded-tl-sm border border-[#F4E8D1]/10 flex items-center h-[52px]">
                                        <div className="flex gap-1.5 opacity-60">
                                            <div className="w-1.5 h-1.5 bg-[#F4E8D1] rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-[#F4E8D1] rounded-full animate-bounce [animation-delay:-.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-[#F4E8D1] rounded-full animate-bounce [animation-delay:-.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-2 shrink-0" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-gradient-to-t from-[#050505] to-[#050505]/95 border-t border-[#F4E8D1]/10">
                        {/* Suggested Follow-ups */}
                        {!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].suggested && (
                            <div className="flex flex-wrap gap-2 justify-start mb-3 overflow-x-auto scrollbar-hide pb-1">
                                {messages[messages.length - 1].suggested?.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="whitespace-nowrap text-[11px] uppercase tracking-wider bg-[#111111] hover:bg-[#F4E8D1]/10 text-[#F4E8D1]/70 px-3 py-2 rounded-lg border border-[#F4E8D1]/10 transition-all duration-300"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative flex items-center group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && input.trim() && sendMessage(input)}
                                placeholder="Inquire with the assistant..."
                                className="w-full bg-[#111111]/80 text-[#F4E8D1] placeholder-[#F4E8D1]/30 pl-5 pr-12 py-4 rounded-2xl border border-[#F4E8D1]/20 focus:outline-none focus:border-[#F4E8D1]/50 focus:bg-[#1a1a1a] transition-all duration-300 text-[14px] tracking-wide shadow-inner"
                                disabled={loading}
                            />
                            <button
                                onClick={() => input.trim() && sendMessage(input)}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 p-2.5 text-[#F4E8D1]/80 hover:text-[#F4E8D1] disabled:text-[#F4E8D1]/20 transition-all duration-300 rounded-xl hover:bg-[#F4E8D1]/10"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIConcierge