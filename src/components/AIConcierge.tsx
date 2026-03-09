// Author: Jeremy Quadri
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Calendar, Download, Sparkles } from 'lucide-react'
import ArchitectureDiagram from './ArchitectureDiagram'

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
}

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<Message>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memory, setMemory] = useState<VisitorMemory | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('jq_visitor')
    if (stored) {
      try {
        setMemory(JSON.parse(stored) as VisitorMemory)
        return
      } catch {
        // corrupted — fall through to create fresh
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const suggestedQuestions = [
    "How do you integrate NVD/EPSS/KEV into risk scoring?",
    "What AI techniques do you use for security automation?",
    "How do you approach Zero Trust architecture?",
    "What's your experience with SAST/DAST integration?"
  ]

  const sendMessage = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text }
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
        codeSnippet: data.codeSnippet
      }])
    } catch (e) {
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
              <div className="fixed bottom-4 right-4 left-4 sm:bottom-8 sm:right-8 sm:left-auto sm:w-96 z-50 h-[600px] glass border border-champagne/30 rounded-3xl flex flex-col shadow-2xl animate-glass-push origin-bottom-right">
          {/* Header */}
          <div className="p-6 border-b border-champagne/20 flex justify-between items-center bg-obsidian/80 backdrop-blur-xl rounded-t-3xl">
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
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center px-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q)}
                      className="text-left text-sm px-3 py-2 rounded-lg border border-champagne/20 hover:border-champagne/50 hover:bg-champagne/5 transition-all"
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
                className={msg.role === 'user'
                  ? 'ml-8 animate-glass-push'
                  : 'flex items-start gap-2 mr-4 animate-glass-push'}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-obsidianLight border border-champagne/20 flex items-center justify-center mt-1">
                    <Sparkles className="w-3 h-3 text-champagne" />
                  </div>
                )}
                <div className={msg.role === 'assistant' ? 'flex-1 min-w-0' : ''}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-champagne text-obsidian'
                      : 'bg-obsidianLight'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>

                  {msg.action && (
                    <div className="mt-2">
                      {msg.action === 'SHOW_CALENDAR' && (
                        <a
                          href="https://calendar.app.google/c2YP1NDU8cGZieqv9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-champagne text-obsidian rounded-2xl px-4 py-3 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-champagne/20 transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Architecture Review
                        </a>
                      )}

                      {msg.action === 'SHOW_CV' && (
                        <a
                          href="/Jeremy_Quadri_CV.pdf"
                          download="Jeremy_Quadri_CV.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full border border-champagne/50 text-champagne rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-champagne/10 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download Professional CV (PDF)
                        </a>
                      )}

                      {msg.action === 'RENDER_CODE' && msg.codeSnippet && (
                        <pre className="bg-obsidian/50 backdrop-blur-sm border border-champagne/10 rounded-2xl p-4 text-xs font-mono text-gray-300 overflow-x-auto">
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
            ))}

            {loading && (
              <div className="flex gap-2 p-4 rounded-2xl bg-obsidianLight mr-8">
                <div className="w-2 h-2 bg-champagne rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-champagne rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-champagne rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4 shrink-0" />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-champagne/20 bg-obsidian/80 backdrop-blur-xl rounded-b-3xl">
            <div className="flex gap-2 shadow-xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && input.trim() && sendMessage(input)}
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

export default AIConcierge
