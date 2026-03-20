'use client'

import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import type { VideoReviewRequest, SavedReport, AnalysisReport } from '@/lib/types'

type Platform = VideoReviewRequest['platform']

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { value: 'instagram', label: 'Instagram Reels', emoji: '📸' },
  { value: 'youtube', label: 'YouTube Shorts', emoji: '▶️' },
  { value: 'other', label: 'Other', emoji: '📱' },
]

// 8 positions for richer temporal coverage
const FRAME_POSITIONS = [0.03, 0.13, 0.25, 0.38, 0.52, 0.66, 0.80, 0.93]

interface ExtractedFrames {
  dataUrls: string[]
  videoDuration: number
  videoName: string
}

interface Props {
  onReportSaved?: (reportId: string) => void
}

export default function VideoReviewer({ onReportSaved }: Props) {
  const [frames, setFrames] = useState<ExtractedFrames | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [niche, setNiche] = useState('')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
  const [audioContext, setAudioContext] = useState('')
  const [captionText, setCaptionText] = useState('')
  const [review, setReview] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'review' | 'frames'>('review')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractFrames = useCallback((file: File): Promise<ExtractedFrames> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))

      const objectUrl = URL.createObjectURL(file)
      video.src = objectUrl
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        const duration = video.duration
        const dataUrls: string[] = []
        let current = 0

        const captureNext = () => {
          if (current >= FRAME_POSITIONS.length) {
            URL.revokeObjectURL(objectUrl)
            resolve({ dataUrls, videoDuration: duration, videoName: file.name })
            return
          }
          video.currentTime = duration * FRAME_POSITIONS[current]
        }

        video.onseeked = () => {
          const MAX_W = 720
          const aspect = video.videoWidth / video.videoHeight
          const w = Math.min(video.videoWidth, MAX_W)
          const h = Math.round(w / aspect)
          canvas.width = w
          canvas.height = h
          ctx.drawImage(video, 0, 0, w, h)
          dataUrls.push(canvas.toDataURL('image/jpeg', 0.80))
          current++
          captureNext()
        }

        video.onerror = () => reject(new Error('Could not load video'))
        captureNext()
      }

      video.onerror = () => reject(new Error('Invalid video file'))
      video.load()
    })
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Bitte eine Videodatei hochladen (MP4, MOV, WebM, etc.)')
      return
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('Video muss kleiner als 500MB sein')
      return
    }
    setError('')
    setFrames(null)
    setReview('')
    setSaved(false)
    setIsExtracting(true)
    try {
      const extracted = await extractFrames(file)
      setFrames(extracted)
    } catch {
      setError('Frames konnten nicht extrahiert werden. Bitte ein anderes Video versuchen.')
    } finally {
      setIsExtracting(false)
    }
  }, [extractFrames])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frames || !niche.trim() || !audience.trim() || isReviewing) return

    setReview('')
    setSaved(false)
    setIsReviewing(true)
    setError('')
    setActiveTab('review')

    try {
      const body: VideoReviewRequest = {
        frames: frames.dataUrls,
        platform,
        niche: niche.trim(),
        audience: audience.trim(),
        goal: goal.trim() || 'Follower wachsen lassen und Engagement steigern',
        audioContext: audioContext.trim(),
        captionText: captionText.trim(),
        videoDurationSec: Math.round(frames.videoDuration),
      }

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok || !res.body) throw new Error('Review request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setReview(accumulated)
      }
    } catch {
      setError('Review fehlgeschlagen. API-Key prüfen und erneut versuchen.')
    } finally {
      setIsReviewing(false)
    }
  }

  const saveReview = () => {
    if (!review || !frames) return
    try {
      const id = `reel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const title = `Reel Review · ${niche || 'Video'} · ${platform}`
      const summaryMatch = review.match(/(?:Overall|Viral Potential|Performance)[\s\S]{0,200}/)
      const summary = summaryMatch ? summaryMatch[0].replace(/[#*]/g, '').trim().slice(0, 120) : 'Reel-Analyse abgeschlossen'

      // Build a simplified AnalysisReport for storage compatibility
      const fakeReport: AnalysisReport = {
        id,
        type: 'reel_review',
        createdAt: new Date().toISOString(),
        title,
        overallScore: 0,
        tier: 'Average',
        platform,
        niche,
        executiveSummary: [summary],
        specialists: [],
        actionPlan: { immediate: [], next: [], strategic: [] },
        dimensionScores: [],
        rawMarkdown: review,
        inputFrames: frames.dataUrls.slice(0, 4),
      }

      const saved_report: SavedReport = {
        id,
        type: 'reel_review',
        createdAt: new Date().toISOString(),
        title,
        summary,
        overallScore: 0,
        tier: 'Reel Review',
        niche,
        platform,
        report: fakeReport,
        inputFrames: frames.dataUrls.slice(0, 4),
      }

      const existing = JSON.parse(localStorage.getItem('influencer_reports') || '[]') as SavedReport[]
      localStorage.setItem('influencer_reports', JSON.stringify([saved_report, ...existing].slice(0, 20)))
      setSaved(true)
      onReportSaved?.(id)
    } catch {}
  }

  const reset = () => {
    setFrames(null)
    setReview('')
    setError('')
    setSaved(false)
    setNiche('')
    setAudience('')
    setGoal('')
    setAudioContext('')
    setCaptionText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Upload zone */}
      {!frames && !isExtracting && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-14 text-center transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 bg-white/3 hover:border-white/40 hover:bg-white/5'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8 text-4xl">🎬</div>
          <div>
            <p className="text-lg font-semibold text-white">Reel oder TikTok hier ablegen</p>
            <p className="mt-1 text-sm text-gray-400">MP4, MOV, WebM · bis 500MB · oder klicken zum Durchsuchen</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
            {['🪝 Hook', '📖 Storytelling', '⚡ Pacing', '🎵 Audio', '📣 CTA', '🔥 Viral-Potential'].map((t) => (
              <span key={t} className="rounded-full border border-white/8 px-2.5 py-1">{t}</span>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file" accept="video/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Extracting frames */}
      {isExtracting && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-14 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white font-medium">8 Key-Frames werden extrahiert…</p>
          <p className="text-sm text-gray-400">Einen Moment bitte</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Frames preview + form */}
      {frames && !review && !isReviewing && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Frame grid preview */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">
                  ✅ {frames.dataUrls.length} Frames extrahiert
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {frames.videoName} · {Math.round(frames.videoDuration)}s Länge
                </p>
              </div>
              <button type="button" onClick={reset} className="text-xs text-gray-500 hover:text-white transition-colors">
                Entfernen
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {frames.dataUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`Frame ${i + 1}`} className="w-full rounded-lg object-cover aspect-[9/16]" />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-xs font-medium text-white">
                    {Math.round(FRAME_POSITIONS[i] * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Context form */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4">
            <h3 className="font-semibold text-white text-sm">Video-Kontext für die Analyse</h3>

            {/* Platform */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value} type="button" onClick={() => setPlatform(p.value)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      platform === p.value
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-white/12 bg-white/3 text-gray-400 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <span>{p.emoji}</span> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Niche */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Nische <span className="text-red-400">*</span></label>
                <input
                  type="text" value={niche} onChange={(e) => setNiche(e.target.value)}
                  placeholder="z.B. Fitness, Mode, Finance" required
                  className="w-full rounded-xl border border-white/12 bg-white/3 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                />
              </div>
              {/* Audience */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Zielgruppe <span className="text-red-400">*</span></label>
                <input
                  type="text" value={audience} onChange={(e) => setAudience(e.target.value)}
                  placeholder="z.B. Frauen 25–35, Fitness" required
                  className="w-full rounded-xl border border-white/12 bg-white/3 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
                />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Ziel dieses Videos</label>
              <input
                type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
                placeholder="z.B. Follower gewinnen, Engagement steigern, Produkt promoten"
                className="w-full rounded-xl border border-white/12 bg-white/3 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
              />
            </div>

            {/* Audio Context */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Audio / Sound-Beschreibung
                <span className="ml-1 text-gray-600">(optional, aber empfohlen)</span>
              </label>
              <input
                type="text" value={audioContext} onChange={(e) => setAudioContext(e.target.value)}
                placeholder="z.B. Trending-Sound von TikTok, eigene Voiceover, Hintergrundmusik: energetisch"
                className="w-full rounded-xl border border-white/12 bg-white/3 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Caption / Beschreibung
                <span className="ml-1 text-gray-600">(optional)</span>
              </label>
              <textarea
                value={captionText} onChange={(e) => setCaptionText(e.target.value)}
                rows={2} placeholder="Füge die geplante Caption ein — für Caption-Analyse und Hashtag-Bewertung"
                className="w-full resize-none rounded-xl border border-white/12 bg-white/3 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={!niche.trim() || !audience.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🔍 Vollständige Reel-Analyse starten
            </button>
          </div>
        </form>
      )}

      {/* Loading state during review */}
      {isReviewing && !review && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-10 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-purple-500/25 border-t-purple-500 animate-spin" />
          <p className="font-medium text-white">KI analysiert dein Reel…</p>
          <p className="mt-1 text-sm text-gray-400">Hook · Storytelling · Pacing · Audio · CTA · Viralität</p>
        </div>
      )}

      {/* Review result */}
      {(review || isReviewing) && frames && (
        <div className="space-y-4">
          {/* Frame strip */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {frames.dataUrls.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} alt={`Frame ${i + 1}`} className="h-16 w-auto rounded-lg object-cover border border-white/8" />
                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
                  {Math.round(FRAME_POSITIONS[i] * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Tab selector */}
          <div className="flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1">
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                activeTab === 'review' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              📋 Review
            </button>
            <button
              onClick={() => setActiveTab('frames')}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                activeTab === 'frames' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              🎞️ Alle Frames
            </button>
          </div>

          {/* Review content */}
          {activeTab === 'review' && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              {isReviewing && !review && (
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </span>
                  <span className="text-sm">Analysiere…</span>
                </div>
              )}
              {review && (
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
                  <ReactMarkdown>{review}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Full frame grid */}
          {activeTab === 'frames' && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="grid grid-cols-4 gap-3">
                {frames.dataUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt={`Frame ${i + 1}`} className="w-full rounded-xl object-cover aspect-[9/16]" />
                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2 py-1 text-xs text-white">
                      <div className="font-medium">Frame {i + 1}</div>
                      <div className="text-gray-400">{Math.round(FRAME_POSITIONS[i] * 100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {review && !isReviewing && (
            <div className="flex flex-wrap gap-3">
              {!saved ? (
                <button
                  onClick={saveReview}
                  className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/3 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/8 hover:text-white"
                >
                  💾 Report speichern
                </button>
              ) : (
                <span className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400">
                  ✓ Gespeichert
                </span>
              )}
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/3 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/8 hover:text-white"
              >
                🎬 Weiteres Video analysieren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
