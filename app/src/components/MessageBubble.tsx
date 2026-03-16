'use client'

import ReactMarkdown from 'react-markdown'
import type { Message } from '@/lib/types'
import type { Agent } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
  agent?: Agent
}

export default function MessageBubble({ message, agent }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white shadow-lg">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      {/* Agent avatar */}
      {agent && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
        >
          {agent.emoji}
        </div>
      )}

      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/8 px-4 py-3 text-sm shadow-lg border border-white/10">
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-white prose-headings:font-semibold
          prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2
          prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-1.5
          prose-strong:text-white prose-strong:font-semibold
          prose-em:text-gray-300
          prose-ul:my-2 prose-ul:pl-4
          prose-ol:my-2 prose-ol:pl-4
          prose-li:text-gray-300 prose-li:my-0.5
          prose-code:text-indigo-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-code:text-xs
          prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10
          prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-400
          prose-hr:border-white/10
          prose-table:text-xs
          prose-th:text-white prose-th:bg-white/10
          prose-td:text-gray-300 prose-td:border-white/10
        ">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
