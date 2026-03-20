'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Agent, SavedReport } from '@/lib/types'
import AgentCard from '@/components/AgentCard'
import ChatInterface from '@/components/ChatInterface'

const AGENTS_META = [
  { id: 'growth-coach', emoji: '🌟', color: '#7B2FBE', name: 'Growth Coach', vibe: 'Full account audits & 30/60/90-day roadmaps' },
  { id: 'performance-analyst', emoji: '📊', color: '#1A73E8', name: 'Performance Analyst', vibe: 'Score every post, decode engagement patterns' },
  { id: 'viral-architect', emoji: '⚡', color: '#FF3B30', name: 'Viral Architect', vibe: 'Hook formulas, trend hijacking, viral blueprints' },
  { id: 'audience-intel', emoji: '🧠', color: '#00B4A6', name: 'Audience Intelligence', vibe: 'Psychographic profiles, superfan cultivation' },
  { id: 'brand-deal', emoji: '💰', color: '#F4A900', name: 'Brand Deal Strategist', vibe: 'Rate cards, media kits, negotiation mastery' },
]

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentReports, setRecentReports] = useState<SavedReport[]>([])

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => { setAgents(data); setLoading(false) })
      .catch(() => setLoading(false))

    // Load recent reports from localStorage
    try {
      const saved = localStorage.getItem('influencer_reports')
      if (saved) {
        const reports: SavedReport[] = JSON.parse(saved)
        setRecentReports(reports.slice(0, 3))
      }
    } catch {}
  }, [])

  if (selectedAgent) {
    return <ChatInterface agent={selectedAgent} onBack={() => setSelectedAgent(null)} />
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full bg-indigo-600/8 blur-3xl" />
        <div className="absolute top-1/2 -left-60 h-[500px] w-[500px] rounded-full bg-purple-600/6 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-pink-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="pt-20 pb-16 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Claude AI · 5 Specialists
          </div>

          <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Your AI-Powered
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instagram Growth Coach
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            Enter your handle, upload your Reel, or share your Insights — and get a structured expert analysis
            from 5 AI specialists within minutes. No fluff, just clear actions.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            {['5 AI Specialists', 'Structured Reports', 'Priority Action Plans', 'Local & Private'].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-indigo-500" />
                {b}
              </span>
            ))}
          </div>
        </section>

        {/* ── 3 ENTRY PATHS ──────────────────────────────────────── */}
        <section className="pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Path 1: Account Analysis */}
            <Link
              href="/analyze"
              className="group relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-6 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl">
                📱
              </div>
              <h3 className="text-base font-semibold text-white">Analyze Account</h3>
              <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                Enter your Instagram handle + key metrics. Get a full growth roadmap from all 5 specialists.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-400">
                Enter handle <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="absolute top-3 right-3 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">Multi-agent</div>
            </Link>

            {/* Path 2: Reel Review */}
            <Link
              href="/review"
              className="group relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl">
                🎬
              </div>
              <h3 className="text-base font-semibold text-white">Review My Reel</h3>
              <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                Upload your video. Get scores for hook, pacing, storytelling, audio, CTA and virality potential.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-purple-400">
                Upload video <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="absolute top-3 right-3 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">Video + Audio</div>
            </Link>

            {/* Path 3: Insights */}
            <Link
              href="/analyze?tab=insights"
              className="group relative overflow-hidden rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 p-6 transition-all hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 hover:scale-[1.02]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20 text-2xl">
                📊
              </div>
              <h3 className="text-base font-semibold text-white">Upload Insights</h3>
              <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
                Share screenshots of your Instagram Insights. Get data-driven analysis and optimization plan.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-teal-400">
                Upload screenshots <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="absolute top-3 right-3 rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-300">Screenshot upload</div>
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section className="pb-16">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
            <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">How It Works</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Share your content',
                  desc: 'Enter your Instagram handle, upload your Reel, or share Insights screenshots. The more context, the better the analysis.',
                  icon: '📥',
                },
                {
                  step: '02',
                  title: '5 specialists analyze',
                  desc: 'Your Growth Coach, Performance Analyst, Viral Architect, Audience Intel agent, and Brand Deal Strategist each review from their angle.',
                  icon: '🤖',
                },
                {
                  step: '03',
                  title: 'Get your action plan',
                  desc: 'A consolidated report with scores, key findings, and a prioritized action plan: Immediate, Next Up, and Strategic.',
                  icon: '🎯',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-xl">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-xs font-mono text-indigo-400">{item.step}</div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECENT REPORTS ─────────────────────────────────────── */}
        {recentReports.length > 0 && (
          <section className="pb-16">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Recent Reports</h2>
              <Link href="/reports" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {recentReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/reports/${r.id}`}
                  className="group rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:border-white/15 hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{r.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()} · {r.niche || r.platform || ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-white">{r.overallScore}</div>
                      <div className="text-xs text-gray-500">/100</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 line-clamp-2">{r.summary}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── SPECIALISTS ────────────────────────────────────────── */}
        <section className="pb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your 5-Person Expert Team</h2>
              <p className="mt-1 text-sm text-gray-400">Chat directly with any specialist, or use an analysis flow to get all five perspectives at once.</p>
            </div>
            {recentReports.length === 0 && (
              <Link href="/reports" className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 transition-colors hover:text-white">
                📁 Saved Reports
              </Link>
            )}
          </div>

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
                Make sure the marketing agent files are in place and add your{' '}
                <code className="text-red-300">ANTHROPIC_API_KEY</code> to <code className="text-red-300">.env.local</code>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer className="border-t border-white/8 py-8 text-center">
          <p className="text-xs text-gray-600">
            Influencer Growth Suite · All analyses run locally · Powered by Claude AI
            {' · '}
            <code className="text-indigo-500/70">ANTHROPIC_API_KEY</code> required in <code className="text-indigo-500/70">.env.local</code>
          </p>
        </footer>
      </div>
    </div>
  )
}
