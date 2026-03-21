'use client'

import type { Agent } from '@/lib/types'

interface AgentHeaderProps {
  agent: Agent
  onBack: () => void
  onNewChat: () => void
}

export default function AgentHeader({ agent, onBack, onNewChat }: AgentHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b border-white/10 bg-black/40 px-6 py-4 backdrop-blur-sm">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Agents
      </button>

      <div className="h-5 w-px bg-white/10" />

      {/* Agent identity */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl"
        style={{ backgroundColor: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
      >
        {agent.emoji}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{agent.name}</h2>
        <p className="text-xs text-gray-500 line-clamp-1">{agent.vibe}</p>
      </div>

      {/* Active indicator */}
      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
        <button
          onClick={onNewChat}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          New Chat
        </button>
      </div>
    </div>
  )
}
