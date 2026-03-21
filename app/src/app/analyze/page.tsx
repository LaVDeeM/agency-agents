'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import StructuredReport from '@/components/StructuredReport'
import type { AnalysisReport, AccountAnalysisRequest, InsightsAnalysisRequest, SavedReport } from '@/lib/types'

type Tab = 'account' | 'insights'

function AnalyzePage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>(
    searchParams.get('tab') === 'insights' ? 'insights' : 'account'
  )

  // Account form
  const [handle, setHandle] = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')
  const [followers, setFollowers] = useState('')
  const [engagement, setEngagement] = useState('')
  const [niche, setNiche] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentMix, setContentMix] = useState('')
  const [postingFreq, setPostingFreq] = useState('')
  const [topPost, setTopPost] = useState('')
  const [goals, setGoals] = useState('')

  // Insights form
  const [insightsHandle, setInsightsHandle] = useState('')
  const [insightsPlatform, setInsightsPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram')
  const [insightsNiche, setInsightsNiche] = useState('')
  const [insightsAudience, setInsightsAudience] = useState('')
  const [insightsGoals, setInsightsGoals] = useState('')
  const [insightsContext, setInsightsContext] = useState('')
  const [insightsImages, setInsightsImages] = useState<string[]>([])
  const [isDraggingInsights, setIsDraggingInsights] = useState(false)
  const insightsInputRef = useRef<HTMLInputElement>(null)

  // Shared state
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const AGENT_NAMES = [
    { emoji: '🌟', name: 'Growth Coach' },
    { emoji: '📊', name: 'Performance Analyst' },
    { emoji: '⚡', name: 'Viral Architect' },
    { emoji: '🧠', name: 'Audience Intel' },
    { emoji: '💰', name: 'Brand Deal' },
  ]

  // Animate loading steps
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return }
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % (AGENT_NAMES.length + 1))
    }, 1200)
    return () => clearInterval(interval)
  }, [loading])

  const handleInsightsFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).slice(0, 6 - insightsImages.length).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setInsightsImages((prev) => [...prev, result].slice(0, 6))
      }
      reader.readAsDataURL(file)
    })
  }, [insightsImages])

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setReport(null)
    setSaved(false)
    setLoading(true)

    try {
      const accountData: AccountAnalysisRequest = {
        handle: handle.replace('@', ''),
        platform,
        followers: parseInt(followers.replace(/[^0-9]/g, '')) || 0,
        avgEngagementRate: parseFloat(engagement) || 0,
        niche: niche.trim(),
        targetAudience: targetAudience.trim(),
        contentMix: contentMix.trim(),
        postingFrequency: postingFreq.trim(),
        topPostDescription: topPost.trim(),
        currentGoals: goals.trim(),
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'account', accountData }),
      })

      if (!res.ok) throw new Error('Analysis failed')
      const data: AnalysisReport = await res.json()
      setReport(data)
    } catch {
      setError('Analyse fehlgeschlagen. Bitte API-Key prüfen und erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  const submitInsights = async (e: React.FormEvent) => {
    e.preventDefault()
    if (insightsImages.length === 0) { setError('Bitte mindestens einen Screenshot hochladen.'); return }
    setError('')
    setReport(null)
    setSaved(false)
    setLoading(true)

    try {
      const insightsData: InsightsAnalysisRequest = {
        handle: insightsHandle.replace('@', ''),
        platform: insightsPlatform,
        niche: insightsNiche.trim(),
        targetAudience: insightsAudience.trim(),
        insightsImages,
        additionalContext: insightsContext.trim(),
        currentGoals: insightsGoals.trim(),
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'insights', insightsData }),
      })

      if (!res.ok) throw new Error('Analysis failed')
      const data: AnalysisReport = await res.json()
      setReport(data)
    } catch {
      setError('Analyse fehlgeschlagen. Bitte API-Key prüfen und erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  const saveReport = () => {
    if (!report) return
    try {
      const saved_report: SavedReport = {
        id: report.id,
        type: report.type,
        createdAt: report.createdAt,
        title: report.title,
        summary: report.executiveSummary[0] || '',
        overallScore: report.overallScore,
        tier: report.tier,
        niche: report.niche,
        handle: report.handle,
        platform: report.platform,
        report,
      }
      const existing = JSON.parse(localStorage.getItem('influencer_reports') || '[]') as SavedReport[]
      const filtered = existing.filter((r) => r.id !== report.id)
      localStorage.setItem('influencer_reports', JSON.stringify([saved_report, ...filtered].slice(0, 20)))
      setSaved(true)
    } catch {}
  }

  const resetForm = () => {
    setReport(null)
    setSaved(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/8 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-purple-600/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        {!report && (
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
              🤖 Multi-Agenten Analyse
            </div>
            <h1 className="text-3xl font-bold text-white">
              Account <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">analysieren</span>
            </h1>
            <p className="mt-2 text-gray-400 text-sm leading-relaxed max-w-lg">
              Alle 5 KI-Spezialisten analysieren deinen Account gleichzeitig und liefern einen konsolidierten Report mit priorisierten Maßnahmen.
            </p>
          </div>
        )}

        {/* Tabs */}
        {!report && !loading && (
          <div className="mb-6 flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1">
            <button
              onClick={() => setTab('account')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === 'account' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              📱 Account-Daten eingeben
            </button>
            <button
              onClick={() => setTab('insights')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === 'insights' ? 'bg-teal-500/20 text-teal-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              📊 Insights hochladen
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin" />
              <h3 className="text-lg font-semibold text-white">5 Spezialisten analysieren…</h3>
              <p className="mt-1 text-sm text-gray-400">Das dauert ca. 10–20 Sekunden</p>
            </div>
            <div className="mx-auto max-w-xs space-y-2">
              {AGENT_NAMES.map((agent, i) => (
                <div
                  key={agent.name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-500 ${
                    i === loadingStep % AGENT_NAMES.length
                      ? 'bg-indigo-500/15 text-white'
                      : i < loadingStep % AGENT_NAMES.length
                      ? 'text-gray-500'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="text-sm">{agent.emoji}</span>
                  <span className="text-sm">{agent.name}</span>
                  {i < loadingStep % AGENT_NAMES.length && (
                    <span className="ml-auto text-xs text-emerald-400">✓</span>
                  )}
                  {i === loadingStep % AGENT_NAMES.length && (
                    <span className="ml-auto flex gap-0.5">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Report */}
        {report && !loading && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-400">Analyse-Ergebnis</h2>
              <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                ← Neue Analyse
              </button>
            </div>
            <StructuredReport
              report={report}
              onSave={!saved ? saveReport : undefined}
            />
            {saved && (
              <p className="mt-3 text-center text-xs text-emerald-400">✓ Report gespeichert · <Link href="/reports" className="underline">Alle Reports ansehen</Link></p>
            )}
          </div>
        )}

        {/* ── Account Form ──────────────────────────────────────────── */}
        {tab === 'account' && !loading && !report && (
          <form onSubmit={submitAccount} className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 space-y-5">
              <h3 className="font-semibold text-white text-sm">Account-Informationen</h3>

              {/* Platform + Handle */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as 'instagram')}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/60 appearance-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Handle <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={handle} onChange={(e) => setHandle(e.target.value)}
                    placeholder="@dein_account"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              {/* Followers + Engagement */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Follower <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={followers} onChange={(e) => setFollowers(e.target.value)}
                    placeholder="z.B. 12.500"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Ø Engagement-Rate % <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={engagement} onChange={(e) => setEngagement(e.target.value)}
                    placeholder="z.B. 3.2"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              {/* Niche + Audience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Nische <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={niche} onChange={(e) => setNiche(e.target.value)}
                    placeholder="z.B. Fitness, Mode, Finance"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Zielgruppe <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="z.B. Frauen 25–35, Fitness"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              {/* Content Mix + Posting */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Content-Mix</label>
                  <input
                    type="text" value={contentMix} onChange={(e) => setContentMix(e.target.value)}
                    placeholder="z.B. 70% Reels, 20% Karussell"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Posting-Frequenz</label>
                  <input
                    type="text" value={postingFreq} onChange={(e) => setPostingFreq(e.target.value)}
                    placeholder="z.B. 4x pro Woche"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              {/* Top Post */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Bester Post (beschreibe ihn kurz)</label>
                <textarea
                  value={topPost} onChange={(e) => setTopPost(e.target.value)}
                  rows={2}
                  placeholder="z.B. Reel über Morgenroutine, 45K Views, Thema: 5 Gewohnheiten für mehr Energie"
                  className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Deine aktuellen Ziele</label>
                <textarea
                  value={goals} onChange={(e) => setGoals(e.target.value)}
                  rows={2}
                  placeholder="z.B. In 3 Monaten auf 25K wachsen, ersten Brand Deal abschließen"
                  className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!handle || !followers || !engagement || !niche || !targetAudience}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🚀 5-Spezialist-Analyse starten
            </button>
          </form>
        )}

        {/* ── Insights Form ─────────────────────────────────────────── */}
        {tab === 'insights' && !loading && !report && (
          <form onSubmit={submitInsights} className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 space-y-5">
              <h3 className="font-semibold text-white text-sm">Insights hochladen</h3>

              {/* Upload Zone */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">
                  Screenshots deiner Insights <span className="text-red-400">*</span>
                  <span className="ml-1 text-gray-600">(max. 6 Bilder)</span>
                </label>
                <div
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDraggingInsights(false)
                    handleInsightsFiles(e.dataTransfer.files)
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingInsights(true) }}
                  onDragLeave={() => setIsDraggingInsights(false)}
                  onClick={() => insightsInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                    isDraggingInsights
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-3xl">📊</div>
                  <div>
                    <p className="text-sm font-medium text-white">Insights-Screenshots hier ablegen</p>
                    <p className="mt-0.5 text-xs text-gray-500">PNG, JPG · bis zu 6 Bilder · oder klicken zum Auswählen</p>
                  </div>
                  <input
                    ref={insightsInputRef}
                    type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => handleInsightsFiles(e.target.files)}
                  />
                </div>

                {insightsImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {insightsImages.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt={`Insight ${i + 1}`} className="h-16 w-auto rounded-lg object-cover border border-white/10" />
                        <button
                          type="button"
                          onClick={() => setInsightsImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Handle + Platform */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Platform</label>
                  <select
                    value={insightsPlatform}
                    onChange={(e) => setInsightsPlatform(e.target.value as 'instagram')}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-500/60 appearance-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Handle <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={insightsHandle} onChange={(e) => setInsightsHandle(e.target.value)}
                    placeholder="@dein_account" required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/60"
                  />
                </div>
              </div>

              {/* Niche + Audience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Nische <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={insightsNiche} onChange={(e) => setInsightsNiche(e.target.value)}
                    placeholder="z.B. Fitness, Mode" required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Zielgruppe <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={insightsAudience} onChange={(e) => setInsightsAudience(e.target.value)}
                    placeholder="z.B. Männer 18–28" required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/60"
                  />
                </div>
              </div>

              {/* Goals + Context */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Ziele & Kontext</label>
                <textarea
                  value={insightsContext} onChange={(e) => setInsightsContext(e.target.value)}
                  rows={2}
                  placeholder="Was möchtest du erreichen? Was funktioniert aktuell gut oder schlecht?"
                  className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={insightsImages.length === 0 || !insightsHandle || !insightsNiche || !insightsAudience}
              className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📊 Insights analysieren lassen
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AnalyzePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <AnalyzePage />
    </Suspense>
  )
}
