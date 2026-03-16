'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Agent } from '@/lib/types'
import AgentCard from '@/components/AgentCard'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => {
        setAgents(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (selectedAgent) {
    return (
      <ChatInterface
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-pink-600/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Influencer Growth
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Suite</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400 leading-relaxed">
            Five AI specialists dedicated to reviewing your content, growing your audience, and building your income.
          </p>

          {/* Review Reel CTA */}
          <Link
            href="/review"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:scale-[1.02]"
          >
            <span className="text-xl">🎬</span>
            <div className="text-left">
              <div>Review My Reel / TikTok</div>
              <div className="text-xs font-normal text-indigo-200 mt-0.5">Upload your video for instant AI performance analysis</div>
            </div>
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Divider */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-gray-500 font-medium">Or chat with a specialist</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Agent grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="text-red-400 font-medium">Could not load agents</p>
            <p className="mt-2 text-sm text-red-400/70">
              Make sure the marketing agent files are in the correct location and restart the dev server.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={setSelectedAgent}
              />
            ))}
          </div>
        )}

        {/* Footer hint */}
        <p className="mt-12 text-center text-xs text-gray-600">
          Each agent is powered by Claude claude-sonnet-4-6 with a specialized system prompt tailored to influencer growth.
          <br />
          Add your <code className="text-indigo-400">ANTHROPIC_API_KEY</code> to <code className="text-indigo-400">.env.local</code> to get started.
        </p>
      </div>
    </div>
  )
}
