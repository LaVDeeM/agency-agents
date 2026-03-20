'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import StructuredReport from '@/components/StructuredReport'
import type { SavedReport } from '@/lib/types'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setSavedReport] = useState<SavedReport | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('influencer_reports')
      if (!saved) { setNotFound(true); return }
      const reports: SavedReport[] = JSON.parse(saved)
      const found = reports.find((r) => r.id === params.id)
      if (found) setSavedReport(found)
      else setNotFound(true)
    } catch {
      setNotFound(true)
    }
  }, [params.id])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔍</div>
          <h2 className="text-lg font-semibold text-white">Report nicht gefunden</h2>
          <p className="mt-2 text-sm text-gray-400">Dieser Report existiert nicht oder wurde gelöscht.</p>
          <Link href="/reports" className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            Alle Reports
          </Link>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  const isReel = report.type === 'reel_review'

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        {/* Nav */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/reports" className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Alle Reports
          </Link>
          <div className="text-xs text-gray-600">
            {new Date(report.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Reel review — render markdown */}
        {isReel && report.report.rawMarkdown ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white">{report.title}</h1>
              {report.niche && <p className="mt-1 text-sm text-gray-500">Nische: {report.niche} · {report.platform}</p>}
            </div>

            {/* Frame strip */}
            {report.inputFrames && report.inputFrames.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {report.inputFrames.map((url, i) => (
                  <img key={i} src={url} alt={`Frame ${i + 1}`} className="h-20 w-auto shrink-0 rounded-lg object-cover border border-white/10" />
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2
                prose-h3:text-sm prose-h3:mt-3
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-strong:text-white
                prose-ul:pl-4 prose-li:text-gray-300
                prose-ol:pl-4
                prose-code:text-purple-300 prose-code:bg-white/8 prose-code:px-1 prose-code:rounded prose-code:text-xs
                prose-hr:border-white/10
              ">
                <ReactMarkdown>{report.report.rawMarkdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          /* Structured report for account/insights analysis */
          <StructuredReport
            report={report.report}
            inputFrames={report.inputFrames}
          />
        )}
      </div>
    </div>
  )
}
