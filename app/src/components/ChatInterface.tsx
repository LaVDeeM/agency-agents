'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Agent, Message } from '@/lib/types'
import AgentHeader from './AgentHeader'
import MessageBubble from './MessageBubble'
import QuickPrompts from './QuickPrompts'

interface ChatInterfaceProps {
  agent: Agent
  onBack: () => void
}

export default function ChatInterface({ agent, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleNewChat = () => {
    abortRef.current?.abort()
    setMessages([])
    setInput('')
    setIsStreaming(false)
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Placeholder for streaming assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, messages: updatedMessages }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated }
          return updated
        })
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠️ Something went wrong. Please check your API key and try again.',
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [agent.id, messages, isStreaming])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <AgentHeader agent={agent} onBack={onBack} onNewChat={handleNewChat} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-end pb-4">
            {/* Welcome state */}
            <div className="mb-8 flex flex-col items-center gap-3 px-6 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-xl"
                style={{ backgroundColor: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
              >
                {agent.emoji}
              </div>
              <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
              <p className="max-w-md text-sm text-gray-400 leading-relaxed">{agent.description}</p>
            </div>
            <div className="w-full max-w-3xl">
              <QuickPrompts agent={agent} onSelect={sendMessage} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} agent={agent} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3">
                <div
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                  style={{ backgroundColor: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
                >
                  {agent.emoji}
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/8 px-4 py-3 border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/30 px-4 py-4 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 transition-colors focus-within:border-white/30">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: input.trim() && !isStreaming ? agent.color : 'transparent',
                border: `1px solid ${agent.color}66`,
              }}
            >
              {isStreaming ? (
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-600">
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  )
}
