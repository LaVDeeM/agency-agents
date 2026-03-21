'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SavedReport, AccountContext, Agent } from '@/lib/types'

const TIER_COLOR: Record<string, string> = {
  'Viral Potential': 'text-emerald-400',
  'Strong Potential': 'text-indigo-400',
  'Average': 'text-yellow-400',
  'Needs Work': 'text-red-400',
  'Reel Review': 'text-purple-400',
}

const TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  reel_review: { label: 'Reel Review', bg: 'bg-purple-500/15 border-purple-500/30', color: 'text-purple-300' },
  account_analysis: { label: 'Account', bg: 'bg-indigo-500/15 border-indigo-500/30', color: 'text-indigo-300' },
  insights_analysis: { label: 'Insights', bg: 'bg-teal-500/15 border-teal-500/30', color: 'text-teal-300' },
}

const QUICK_ACTIONS = [
  {
    href: '/analyze',
    title: 'Account analysieren',
    desc: '5 KI-Spezialisten · Roadmap · Scores',
    icon: '📱',
    gradient: 'from-indigo-500/15 to-purple-500/8 border-indigo-500/25 hover:border-indigo-500/50',
    badge: 'Multi-Agent',
    badgeColor: 'text-indigo-300 bg-indigo-500/15',
  },
  {
    href: '/review',
    title: 'Video reviewen',
    desc: 'Reel · TikTok · Shorts analysieren',
    icon: '🎬',
    gradient: 'from-purple-500/15 to-pink-500/8 border-purple-500/25 hover:border-purple-500/50',
    badge: 'Video + Audio',
    badgeColor: 'text-purple-300 bg-purple-500/15',
  },
  {
    href: '/analyze?tab=insights',
    title: 'Insights hochladen',
    desc: 'Screenshots analysieren lassen',
    icon: '📊',
    gradient: 'from-teal-500/15 to-emerald-500/8 border-teal-500/25 hover:border-teal-500/50',
    badge: 'Screenshot',
    badgeColor: 'text-teal-300 bg-teal-500/15',
  },
]

export default function DashboardPage() {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [accountCtx, setAccountCtx] = useState<AccountContext | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [editingCtx, setEditingCtx] = useState(false)

  // Context form state
  const [ctxHandle, setCtxHandle] = useState('')
  const [ctxPlatform, setCtxPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')
  const [ctxNiche, setCtxNiche] = useState('')
  const [ctxAudience, setCtxAudience] = useState('')
  const [ctxGoals, setCtxGoals] = useState('')
  const [ctxPhase, setCtxPhase] = useState<AccountContext['growthPhase']>('growing')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('influencer_reports')
      if (saved) setReports(JSON.parse(saved))
    } catch {}
    try {
      const ctx = localStorage.getItem('account_context')
      if (ctx) {
        const parsed: AccountContext = JSON.parse(ctx)
        setAccountCtx(parsed)
        setCtxHandle(parsed.handle)
        setCtxPlatform(parsed.platform)
        setCtxNiche(parsed.niche)
        setCtxAudience(parsed.targetAudience)
        setCtxGoals(parsed.goals ?? '')
        setCtxPhase(parsed.growthPhase ?? 'growing')
      }
    } catch {}
    fetch('/api/agents')
      .then((r) => r.json())
      .then(setAgents)
      .catch(() => {})
  }, [])

  const saveContext = () => {
    if (!ctxHandle || !ctxNiche) return
    const ctx: AccountContext = {
      handle: ctxHandle.replace('@', ''),
      platform: ctxPlatform,
      niche: ctxNiche,
      targetAudience: ctxAudience,
      goals: ctxGoals,
      growthPhase: ctxPhase,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('account_context', JSON.stringify(ctx))
    setAccountCtx(ctx)
    setEditingCtx(false)
  }

  const clearContext = () => {
    localStorage.removeItem('account_context')
    setAccountCtx(null)
    setCtxHandle('')
    setCtxNiche('')
    setCtxAudience('')
    setCtxGoals('')
  }

  const recentReports = reports.slice(0, 5)
  const avgScore = reports.length > 0
    ? Math.round(reports.filter(r => r.overallScore > 0).reduce((s, r) => s + r.overallScore, 0) / Math.max(1, reports.filter(r => r.overallScore > 0).length))
    : 0

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full bg-indigo-600/6 blur-3xl" />
        <div className="absolute top-1/2 -left-60 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {accountCtx ? `Hey, @${accountCtx.handle} 👋` : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {accountCtx
                ? `${accountCtx.niche} · ${accountCtx.platform} · ${accountCtx.growthPhase}`
                : 'Starte eine Analyse oder richte deinen Account-Kontext ein.'}
            </p>
          </div>
          {reports.length > 0 && (
            <div className="flex gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-xl font-bold text-white">{reports.length}</div>
                <div className="text-xs text-gray-500">Reports</div>
              </div>
              {avgScore > 0 && (
                <div>
                  <div className="text-xl font-bold text-white">{avgScore}</div>
                  <div className="text-xs text-gray-500">Ø Score</div>
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-white">
                  {reports.filter(r => r.type === 'reel_review').length}
                </div>
                <div className="text-xs text-gray-500">Video Reviews</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Account Context Card ──────────────────────────────────── */}
        {!accountCtx && !editingCtx && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-2xl">⚡</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">Account-Kontext einrichten</h3>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                  Richte einmal deinen Account-Kontext ein — dann werden alle Analysen und Video-Reviews automatisch
                  auf dein Profil zugeschnitten. Nische, Zielgruppe und Ziele müssen nur einmal angegeben werden.
                </p>
              </div>
              <button
                onClick={() => setEditingCtx(true)}
                className="shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Jetzt einrichten
              </button>
            </div>
          </div>
        )}

        {/* Context Form */}
        {editingCtx && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Account-Kontext speichern</h3>
              <button onClick={() => setEditingCtx(false)} className="text-xs text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex gap-2">
                <select
                  value={ctxPlatform}
                  onChange={(e) => setCtxPlatform(e.target.value as 'instagram')}
                  className="w-32 rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-xs text-white outline-none focus:border-indigo-500/60 appearance-none"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
                <input
                  type="text" value={ctxHandle} onChange={(e) => setCtxHandle(e.target.value)}
                  placeholder="@dein_handle *"
                  className="flex-1 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                />
              </div>
              <input
                type="text" value={ctxNiche} onChange={(e) => setCtxNiche(e.target.value)}
                placeholder="Nische *  z.B. Fitness, Finance, Mode"
                className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
              />
              <input
                type="text" value={ctxAudience} onChange={(e) => setCtxAudience(e.target.value)}
                placeholder="Zielgruppe  z.B. Frauen 25–35, Fitness-Interessierte"
                className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
              />
              <select
                value={ctxPhase}
                onChange={(e) => setCtxPhase(e.target.value as AccountContext['growthPhase'])}
                className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/60 appearance-none"
              >
                <option value="new">Phase: Neu (0–1K)</option>
                <option value="growing">Phase: Wachstum (1K–50K)</option>
                <option value="established">Phase: Etabliert (50K+)</option>
                <option value="monetizing">Phase: Monetarisierung</option>
              </select>
              <input
                type="text" value={ctxGoals} onChange={(e) => setCtxGoals(e.target.value)}
                placeholder="Ziele  z.B. 50K Follower, ersten Brand Deal"
                className="sm:col-span-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveContext}
                disabled={!ctxHandle || !ctxNiche}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
              >
                Kontext speichern
              </button>
              <button onClick={() => setEditingCtx(false)} className="rounded-lg border border-white/10 bg-white/3 px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Saved context banner */}
        {accountCtx && !editingCtx && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-medium text-white">@{accountCtx.handle}</span>
                <span className="mx-2 text-gray-600">·</span>
                <span className="text-sm text-gray-400">{accountCtx.niche}</span>
                {accountCtx.targetAudience && (
                  <>
                    <span className="mx-2 text-gray-600">·</span>
                    <span className="hidden sm:inline text-sm text-gray-500">{accountCtx.targetAudience}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditingCtx(true)} className="text-xs text-gray-500 hover:text-white transition-colors">Bearbeiten</button>
              <button onClick={clearContext} className="text-xs text-gray-600 hover:text-red-400 transition-colors">✕</button>
            </div>
          </div>
        )}

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Neue Analyse starten</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all hover:scale-[1.02] hover:shadow-lg ${action.gradient}`}
              >
                <div className={`absolute top-4 right-4 rounded-full px-2 py-0.5 text-xs font-medium ${action.badgeColor}`}>
                  {action.badge}
                </div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-2xl">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{action.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  Starten
                  <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recent Reports ─────────────────────────────────────────── */}
        {recentReports.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Letzte Reports</h2>
              <Link href="/reports" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Alle {reports.length} ansehen →
              </Link>
            </div>
            <div className="space-y-2">
              {recentReports.map((r) => {
                const badge = TYPE_BADGE[r.type] ?? TYPE_BADGE.reel_review
                const tierColor = TIER_COLOR[r.tier] ?? 'text-gray-400'
                return (
                  <Link
                    key={r.id}
                    href={`/reports/${r.id}`}
                    className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:border-white/15 hover:bg-white/5"
                  >
                    {r.inputFrames?.[0] ? (
                      <img src={r.inputFrames[0]} alt="" className="h-12 w-8 shrink-0 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-lg">{badge.label[0]}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                        {r.tier && r.tier !== 'Reel Review' && (
                          <span className={`text-xs font-medium ${tierColor}`}>{r.tier}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {r.niche && ` · ${r.niche}`}
                      </p>
                    </div>
                    {r.overallScore > 0 && (
                      <div className="shrink-0 text-center">
                        <div className={`text-lg font-bold ${tierColor}`}>{r.overallScore}</div>
                        <div className="text-xs text-gray-600">/100</div>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── AI Specialist Team ────────────────────────────────────── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Dein KI-Experten-Team</h2>
              <p className="mt-0.5 text-xs text-gray-600">Chatte direkt mit einem Spezialisten</p>
            </div>
          </div>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:border-white/15 hover:bg-white/5"
                  style={{ borderLeftColor: agent.color, borderLeftWidth: 2 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${agent.color}20` }}>
                      {agent.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{agent.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{agent.vibe}</p>
                  <Link
                    href="/"
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: agent.color }}
                  >
                    Chat starten →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center text-sm text-gray-500">
              Agenten werden geladen…
            </div>
          )}
        </section>

        {/* ── How It Works ──────────────────────────────────────────── */}
        {reports.length === 0 && (
          <section className="mb-10">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
              <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">So funktioniert es</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  { step: '01', icon: '📥', title: 'Account-Kontext einrichten', desc: 'Einmalig Nische, Zielgruppe und Ziele festlegen — das System nutzt diesen Kontext für alle Analysen.' },
                  { step: '02', icon: '🤖', title: '5 Spezialisten analysieren', desc: 'Growth Coach, Performance Analyst, Viral Architect, Audience Intel und Brand Deal Strategist.' },
                  { step: '03', icon: '🎯', title: 'Aktionsplan erhalten', desc: 'Strukturierter Report mit Scores, Key Findings und priorisierten Maßnahmen.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-xl">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <div className="mb-0.5 text-xs font-mono text-indigo-400">{item.step}</div>
                      <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                      <p className="mt-1 text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/8 py-6 text-center">
          <p className="text-xs text-gray-600">
            Influencer Growth Suite · Alle Analysen lokal · Powered by Claude AI
          </p>
        </footer>
      </div>
    </div>
  )
}
