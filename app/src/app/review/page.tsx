import Link from 'next/link'
import VideoReviewer from '@/components/VideoReviewer'

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-purple-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-pink-600/6 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">

        {/* Nav */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </Link>
          <Link href="/reports" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            📁 Gespeicherte Reports
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-300">
            🎬 KI Video-Analyse
          </div>
          <h1 className="text-4xl font-bold text-white">
            Reel &amp; TikTok
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Performance Review</span>
          </h1>
          <p className="mt-3 text-gray-400 leading-relaxed max-w-2xl text-sm">
            Lade dein Video hoch und erhalte eine vollständige Analyse: Hook-Stärke, Storytelling-Arc, Pacing, Audio-Strategie, CTA-Qualität und Viralitäts-Potenzial — mit konkreten Verbesserungsmaßnahmen.
          </p>

          {/* Feature tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              '🪝 Hook-Score',
              '📖 Storytelling-Arc',
              '⚡ Pacing & Dynamik',
              '🎵 Audio-Analyse',
              '📣 CTA-Qualität',
              '🔥 Viral-Potenzial',
              '📝 Caption-Audit',
              '🖼️ Bester Thumbnail',
              '🔝 Top-5-Maßnahmen',
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 bg-white/3 px-3 py-1 text-xs text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Main component */}
        <VideoReviewer />

        {/* Bottom hint */}
        <div className="mt-10 rounded-xl border border-white/8 bg-white/3 p-4 text-center text-xs text-gray-600">
          Willst du deinen gesamten Account analysieren lassen?{' '}
          <Link href="/analyze" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            5-Spezialist-Analyse starten →
          </Link>
        </div>
      </div>
    </div>
  )
}
