'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import StructuredReport from '@/components/StructuredReport'
import type { SavedReport } from '@/lib/types'

type LoadState = 'loading' | 'found' | 'not_found' | 'error'

export default function ReportDetailPage() {
  const params = useParams()
  const [report, setSavedReport] = useState<SavedReport | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')

  useEffect(() => {
    // params.id can be string | string[] — normalize it
    const rawId = params?.id
    if (!rawId) { setLoadState('not_found'); return }
    const id = Array.isArray(rawId) ? rawId[0] : rawId
    if (!id) { setLoadState('not_found'); return }

    try {
      const saved = localStorage.getItem('influencer_reports')
      if (!saved) { setLoadState('not_found'); return }

      let reports: SavedReport[]
      try {
        reports = JSON.parse(saved)
      } catch {
        setLoadState('error')
        return
      }

      if (!Array.isArray(reports)) { setLoadState('not_found'); return }

      const found = reports.find((r) => r.id === id)
      if (found) {
        setSavedReport(found)
        setLoadState('found')
      } else {
        setLoadState('not_found')
      }
    } catch {
      setLoadState('error')
    }
  }, [params?.id])

  // Loading
  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500">Report wird geladen…</p>
        </div>
      </div>
    )
  }

  // Not found / error
  if (loadState === 'not_found' || loadState === 'error' || !report) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
            🔍
          </div>
          <h2 className="text-lg font-semibold text-white">Report nicht gefunden</h2>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            {loadState === 'error'
              ? 'Beim Laden dieses Reports ist ein Fehler aufgetreten.'
              : 'Dieser Report existiert nicht mehr oder wurde gelöscht.'}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/reports"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
            >
              Alle Reports ansehen
            </Link>
            <Link
              href="/analyze"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10"
            >
              Neue Analyse starten
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isReel = report.type === 'reel_review'

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        {/* Nav */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Alle Reports
          </Link>
          <div className="text-xs text-gray-600">
            {new Date(report.createdAt).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Reel review — render structured markdown */}
        {isReel && report.report.rawMarkdown ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white">{report.title}</h1>
              {report.niche && (
                <p className="mt-1 text-sm text-gray-500">
                  Nische: {report.niche} · {report.platform}
                </p>
              )}
            </div>

            {/* Frame strip */}
            {report.inputFrames && report.inputFrames.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {report.inputFrames.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Frame ${i + 1}`}
                    className="h-20 w-auto shrink-0 rounded-lg object-cover border border-white/10"
                  />
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div
                className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-white prose-headings:font-semibold
                  prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2
                  prose-h3:text-sm prose-h3:mt-3
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-strong:text-white
                  prose-ul:pl-4 prose-li:text-gray-300
                  prose-ol:pl-4
                  prose-code:text-purple-300 prose-code:bg-white/8 prose-code:px-1 prose-code:rounded prose-code:text-xs
                  prose-hr:border-white/10"
              >
                <ReactMarkdown>{report.report.rawMarkdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          /* Structured report for account/insights analysis */
          <StructuredReport report={report.report} inputFrames={report.inputFrames} />
        )}
      </div>
    </div>
  )
}
