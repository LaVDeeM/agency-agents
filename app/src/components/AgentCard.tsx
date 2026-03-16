'use client'

import type { Agent } from '@/lib/types'

interface AgentCardProps {
  agent: Agent
  onSelect: (agent: Agent) => void
}

export default function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={() => onSelect(agent)}
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99]"
    >
      {/* Color accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: agent.color }}
      />

      {/* Emoji + color glow */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-lg"
        style={{ backgroundColor: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
      >
        {agent.emoji}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
        <p className="mt-1 text-sm text-gray-400 leading-relaxed line-clamp-2">
          {agent.vibe}
        </p>
      </div>

      {/* CTA */}
      <div
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: agent.color }}
      >
        <span>Start Chat</span>
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
