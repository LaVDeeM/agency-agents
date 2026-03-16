'use client'

import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import type { VideoReviewRequest } from '@/lib/types'

type Platform = VideoReviewRequest['platform']

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { value: 'instagram', label: 'Instagram Reels', emoji: '📸' },
  { value: 'youtube', label: 'YouTube Shorts', emoji: '▶️' },
  { value: 'other', label: 'Other', emoji: '📱' },
]

interface ExtractedFrames {
  dataUrls: string[]
  videoDuration: number
  videoName: string
}

export default function VideoReviewer() {
  const [frames, setFrames] = useState<ExtractedFrames | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [niche, setNiche] = useState('')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
  const [review, setReview] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [error, setError] = useState('')
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
        const positions = [0.05, 0.30, 0.60, 0.90] // 5%, 30%, 60%, 90%
        const dataUrls: string[] = []
        let current = 0

        const captureNext = () => {
          if (current >= positions.length) {
            URL.revokeObjectURL(objectUrl)
            resolve({ dataUrls, videoDuration: duration, videoName: file.name })
            return
          }
          video.currentTime = duration * positions[current]
        }

        video.onseeked = () => {
          // Size: keep aspect ratio, max 768px wide for Claude
          const MAX_W = 768
          const aspect = video.videoWidth / video.videoHeight
          const w = Math.min(video.videoWidth, MAX_W)
          const h = Math.round(w / aspect)
          canvas.width = w
          canvas.height = h
          ctx.drawImage(video, 0, 0, w, h)
          dataUrls.push(canvas.toDataURL('image/jpeg', 0.85))
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
      setError('Please upload a video file (MP4, MOV, WebM, etc.)')
      return
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('Video file must be under 500MB')
      return
    }

    setError('')
    setFrames(null)
    setReview('')
    setIsExtracting(true)

    try {
      const extracted = await extractFrames(file)
      setFrames(extracted)
    } catch (err) {
      setError('Could not extract frames from video. Please try another file.')
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
    setIsReviewing(true)
    setError('')

    try {
      const body: VideoReviewRequest = {
        frames: frames.dataUrls,
        platform,
        niche: niche.trim(),
        audience: audience.trim(),
        goal: goal.trim() || 'grow followers and engagement',
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
    } catch (err) {
      setError('Review failed. Please check your API key and try again.')
    } finally {
      setIsReviewing(false)
    }
  }

  const reset = () => {
    setFrames(null)
    setReview('')
    setError('')
    setNiche('')
    setAudience('')
    setGoal('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* Upload zone */}
      {!frames && !isExtracting && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-16 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
            🎬
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Drop your reel or TikTok here</p>
            <p className="mt-1 text-sm text-gray-400">
              MP4, MOV, WebM · Up to 500MB · Or click to browse
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Extracting frames */}
      {isExtracting && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-16 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-white">Extracting key frames from your video...</p>
          <p className="text-sm text-gray-400">This takes a moment</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Frames preview + form */}
      {frames && !review && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Extracted frames preview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  ✅ {frames.dataUrls.length} frames extracted
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {frames.videoName} · {Math.round(frames.videoDuration)}s
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {frames.dataUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt={`Frame ${i + 1}`}
                    className="w-full rounded-lg object-cover aspect-[9/16]"
                  />
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                    Frame {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Context form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
            <h3 className="font-semibold text-white">Tell us about this video</h3>

            {/* Platform */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlatform(p.value)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      platform === p.value
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-white/15 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span>{p.emoji}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Niche */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Niche / Topic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. sustainable fashion, fitness, personal finance, cooking"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/8"
              />
            </div>

            {/* Target audience */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Target Audience <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. women 25–35 interested in minimalism and sustainability"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/8"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Goal of this video
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. grow followers, drive engagement, promote a product, build authority"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/8"
              />
            </div>

            <button
              type="submit"
              disabled={!niche.trim() || !audience.trim() || isReviewing}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isReviewing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing your content...
                </span>
              ) : (
                '🔍 Get Professional Review'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Streaming review result */}
      {(review || isReviewing) && frames && (
        <div className="space-y-6">
          {/* Frame strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {frames.dataUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Frame ${i + 1}`}
                className="h-20 w-auto shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>

          {/* Review content */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            {isReviewing && !review && (
              <div className="flex items-center gap-3 text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                </span>
                <span className="text-sm">Analyzing your content...</span>
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
                prose-code:text-indigo-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-code:text-xs
                prose-hr:border-white/10
              ">
                <ReactMarkdown>{review}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          {review && !isReviewing && (
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
              >
                Review Another Video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
