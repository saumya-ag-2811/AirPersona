'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react'
import { useAirPersona } from '@/components/air-persona-provider'
import { askAirPersona } from '@/services/advisoryService'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

// ─── Starter prompt suggestions ───────────────────────────────────────────────
const STARTER_PROMPTS = [
  'Is it safe for me to exercise outdoors today?',
  'How does PM2.5 affect asthma specifically?',
  'What mask should I wear at this AQI level?',
  'When will the air quality be better today?',
] as const

export function AskAirPersona() {
  const { environment, persona } = useAirPersona()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const sendMessage = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // scroll to bottom after adding user message
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)

    const { message } = await askAirPersona(trimmed, environment, persona)

    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, aiMsg])
    setIsLoading(false)

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="mt-10 rounded-3xl border border-border bg-surface/20 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
          <MessageCircle className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Ask AirPersona</p>
          <p className="text-xs text-muted-foreground">
            Grounded answers based on your profile &amp; current conditions
          </p>
        </div>
        <span className="ml-auto rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-accent">
          AI
        </span>
      </div>

      {/* Message list */}
      <div className="flex h-72 flex-col gap-4 overflow-y-auto px-6 py-5 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Bot className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Ask anything about your air today.
            </p>
            {/* Starter prompts */}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-border bg-surface/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={cn('flex items-start gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  msg.role === 'user' ? 'bg-accent/20' : 'bg-surface/60 border border-border',
                )}
              >
                {msg.role === 'user' ? (
                  <User className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              {/* Bubble */}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-accent/15 text-foreground'
                    : 'rounded-tl-sm border border-border bg-surface/40 text-foreground/90',
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface/60">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-surface/40 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 border-t border-hairline px-6 py-4"
      >
        <input
          id="ask-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your air quality…"
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent transition-colors hover:bg-accent/30 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}
