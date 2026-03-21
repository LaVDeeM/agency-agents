'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SavedReport } from '@/lib/types'

const TYPE_LABELS = {
  reel_review: { label: 'Reel Review', emoji: '🎬', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  account_analysis: { label: 'Account-Analyse', emoji: '📱', color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' },
  insights_analysis: { label: 'Insights-Analyse', emoji: '📊', color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30' },
}

const TIER_COLOR: Record<string, string> = {
  'Viral Potential': 'text-emerald-400',
  'Strong Potential': 'text-indigo-400',
  'Average': 'text-yellow-400',
  'Needs Work': 'text-red-400',
  'Reel Review': 'text-purple-400',
}

export default function ReportsPage() {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [filter, setFilter] = useState<'all' | SavedReport['type']>('all')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('influencer_reports')
      if (saved) setReports(JSON.parse(saved))
    } catch {}
  }, [])

  const deleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id)
    setReports(updated)
    localStorage.setItem('influencer_reports', JSON.stringify(updated))
  }

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.type === filter)

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/3 h-96 w-96 rounded-full bg-indigo-600/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Gespeicherte <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Reports</span>
          </h1>
          <p className="mt-1.5 text-sm text-gray-400">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} gespeichert
          </p>
        </div>

        {/* Filter tabs */}
        {reports.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {([
              { value: 'all', label: 'Alle' },
              { value: 'account_analysis', label: '📱 Account' },
              { value: 'insights_analysis', label: '📊 Insights' },
              { value: 'reel_review', label: '🎬 Reels' },
            ] as const).map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as 'all' | SavedReport['type'])}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f.value
                    ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                    : 'border-white/10 bg-white/3 text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {reports.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
            <div className="mb-4 text-4xl">📁</div>
            <h3 className="text-lg font-semibold text-white">Noch keine Reports gespeichert</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
              Starte eine Analyse oder reviewe ein Reel — und speichere das Ergebnis, um es hier zu finden.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/analyze"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
              >
                Account analysieren
              </Link>
              <Link
                href="/review"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white"
              >
                Reel reviewen
              </Link>
            </div>
          </div>
        )}

        {/* Report list */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((report) => {
              const typeCfg = TYPE_LABELS[report.type] ?? TYPE_LABELS.reel_review
              const tierColor = TIER_COLOR[report.tier] ?? 'text-gray-400'
              return (
                <div key={report.id} className="group rounded-2xl border border-white/8 bg-white/3 p-5 transition-all hover:border-white/15 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Thumbnail */}
                      {report.inputFrames && report.inputFrames.length > 0 ? (
                        <img
                          src={report.inputFrames[0]}
                          alt="Thumbnail"
                          className="h-14 w-10 shrink-0 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-white/8 text-2xl">
                          {typeCfg.emoji}
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.emoji} {typeCfg.label}
                          </span>
                          {report.tier && report.tier !== 'Reel Review' && (
                            <span className={`text-xs font-medium ${tierColor}`}>{report.tier}</span>
                          )}
                          {report.overallScore > 0 && (
                            <span className="text-xs text-gray-500">{report.overallScore}/100</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-white text-sm">{report.title}</h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {report.niche && ` · ${report.niche}`}
                          {report.handle && ` · @${report.handle}`}
                        </p>
                        {report.summary && (
                          <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{report.summary}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/reports/${report.id}`}
                        className="rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                      >
                        Öffnen
                      </Link>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="rounded-lg border border-white/8 px-3 py-1.5 text-xs text-gray-600 transition-all hover:border-red-500/30 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && reports.length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center text-sm text-gray-500">
            Keine Reports für diesen Filter gefunden.
          </div>
        )}
      </div>
    </div>
  )
}
