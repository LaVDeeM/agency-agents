'use client'

import { QUICK_PROMPTS } from '@/lib/types'
import type { Agent } from '@/lib/types'

interface QuickPromptsProps {
  agent: Agent
  onSelect: (prompt: string) => void
}

export default function QuickPrompts({ agent, onSelect }: QuickPromptsProps) {
  const prompts = QUICK_PROMPTS[agent.id] ?? []

  if (prompts.length === 0) return null

  return (
    <div className="px-4 pb-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        Quick starts
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelect(prompt)}
            className="group rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-gray-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <span
              className="mb-1 block text-lg leading-none"
              style={{ color: agent.color }}
            >
              {i === 0 ? '🎯' : i === 1 ? '📊' : i === 2 ? '⚡' : '💡'}
            </span>
            <span className="line-clamp-2 leading-relaxed">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
