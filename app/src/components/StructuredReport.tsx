'use client'

import { useState } from 'react'
import type { AnalysisReport, ActionItem } from '@/lib/types'

interface Props {
  report: AnalysisReport
  onSave?: () => void
  onChat?: (agentId: string) => void
  inputFrames?: string[]
}

const TIER_CONFIG = {
  'Viral Potential': { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-400' },
  'Strong Potential': { color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', dot: 'bg-indigo-400' },
  'Average': { color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', dot: 'bg-yellow-400' },
  'Needs Work': { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', dot: 'bg-red-400' },
}

const PRIORITY_CONFIG = {
  immediate: { label: 'Sofort', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  next: { label: 'Als Nächstes', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  strategic: { label: 'Strategisch', bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
}

const IMPACT_ICON = { high: '🔴', medium: '🟡', low: '🟢' }

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circ = 2 * Math.PI * radius
  const filled = (score / 100) * circ
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#6366f1' : score >= 35 ? '#f59e0b' : '#f87171'
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  )
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  const barColor = score >= 75 ? '#34d399' : score >= 50 ? color : score >= 35 ? '#f59e0b' : '#f87171'
  return (
    <div className="h-1.5 w-full rounded-full bg-white/8">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: barColor }}
      />
    </div>
  )
}

function ActionCard({ item }: { item: ActionItem }) {
  const cfg = PRIORITY_CONFIG[item.priority]
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-base">{IMPACT_ICON[item.impact]}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{item.action}</p>
          {item.detail && <p className="mt-1 text-xs text-gray-400 leading-relaxed">{item.detail}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-gray-400">
              Impact: {item.impact}
            </span>
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-gray-400">
              Aufwand: {item.effort}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StructuredReport({ report, onSave, onChat, inputFrames }: Props) {
  const [activeSpecialist, setActiveSpecialist] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'plan' | 'specialists' | 'scores'>('plan')
  const tierCfg = TIER_CONFIG[report.tier] ?? TIER_CONFIG['Average']

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── HEADER CARD ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Title & Meta */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tierCfg.bg} ${tierCfg.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tierCfg.dot}`} />
                {report.tier}
              </span>
              {report.platform && (
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-gray-400">{report.platform}</span>
              )}
              {report.niche && (
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-gray-400">{report.niche}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{report.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(report.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}{report.specialists.length} Specialists analysiert
            </p>

            {/* Executive Summary */}
            {report.executiveSummary.length > 0 && (
              <ul className="mt-4 space-y-2">
                {report.executiveSummary.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 shrink-0 text-indigo-400">◆</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Overall Score */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
              <ScoreRing score={report.overallScore} size={96} />
              <div className="absolute text-center">
                <div className="text-2xl font-bold text-white leading-none">{report.overallScore}</div>
                <div className="text-xs text-gray-500">/100</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Gesamt-Score</div>
          </div>
        </div>

        {/* Save / Chat actions */}
        {(onSave || onChat) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-5">
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
              >
                💾 Report speichern
              </button>
            )}
            {onChat && (
              <button
                onClick={() => onChat('growth-coach')}
                className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/20"
              >
                💬 Rückfragen im Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── VIDEO FRAMES (if reel review) ──────────────────────────── */}
      {inputFrames && inputFrames.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {inputFrames.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Frame ${i + 1}`}
              className="h-20 w-auto shrink-0 rounded-lg object-cover border border-white/10"
            />
          ))}
        </div>
      )}

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1">
        {(['plan', 'specialists', 'scores'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'plan' ? '🎯 Aktionsplan' : tab === 'specialists' ? '🤖 Spezialisten' : '📊 Scores'}
          </button>
        ))}
      </div>

      {/* ── ACTION PLAN TAB ─────────────────────────────────────────── */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {(['immediate', 'next', 'strategic'] as const).map((priority) => {
            const items = report.actionPlan[priority === 'immediate' ? 'immediate' : priority === 'next' ? 'next' : 'strategic']
            if (!items || items.length === 0) return null
            const cfg = PRIORITY_CONFIG[priority]
            return (
              <div key={priority}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</h3>
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-gray-600">{items.length} Maßnahmen</span>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => <ActionCard key={i} item={item} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── SPECIALISTS TAB ─────────────────────────────────────────── */}
      {activeTab === 'specialists' && (
        <div className="space-y-3">
          {report.specialists.map((specialist) => {
            const isOpen = activeSpecialist === specialist.agentId
            return (
              <div
                key={specialist.agentId}
                className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden"
                style={{ borderLeftColor: specialist.agentColor, borderLeftWidth: 3 }}
              >
                <button
                  onClick={() => setActiveSpecialist(isOpen ? null : specialist.agentId)}
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-white/3"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${specialist.agentColor}20` }}
                  >
                    {specialist.agentEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{specialist.agentName}</span>
                      <span className="text-xs text-gray-500">Score: {specialist.score}/100</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400 truncate">{specialist.headline}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20">
                      <ScoreBar score={specialist.score} color={specialist.agentColor} />
                    </div>
                    <svg
                      className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/8 px-5 py-4 space-y-4 animate-fade-in">
                    {/* Key Findings */}
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Key Findings</h4>
                      <ul className="space-y-2">
                        {specialist.keyFindings.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: specialist.agentColor }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    {specialist.recommendations.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Empfehlungen</h4>
                        <div className="space-y-2">
                          {specialist.recommendations.map((r, i) => (
                            <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-3">
                              <p className="text-sm font-medium text-white">{r.action}</p>
                              {r.detail && <p className="mt-1 text-xs text-gray-400">{r.detail}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {onChat && (
                      <button
                        onClick={() => onChat(specialist.agentId)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition-colors hover:text-white"
                      >
                        💬 Mit {specialist.agentName} chatten
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── SCORES TAB ──────────────────────────────────────────────── */}
      {activeTab === 'scores' && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h3 className="mb-5 text-sm font-semibold text-white">Performance-Dimensionen</h3>
          <div className="space-y-5">
            {report.dimensionScores.map((dim) => (
              <div key={dim.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-gray-300">{dim.label}</span>
                  <span className="text-sm font-semibold text-white">{dim.score}/100</span>
                </div>
                <ScoreBar score={dim.score} color="#6366f1" />
                {dim.note && <p className="mt-1 text-xs text-gray-500">{dim.note}</p>}
              </div>
            ))}
          </div>

          {/* Specialist Score Grid */}
          <div className="mt-6 border-t border-white/8 pt-5">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Spezialist-Scores</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {report.specialists.map((s) => (
                <div key={s.agentId} className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/3 p-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                    style={{ backgroundColor: `${s.agentColor}25` }}
                  >
                    {s.agentEmoji}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{s.score}</div>
                    <div className="text-xs text-gray-500 leading-tight">{s.agentName.split(' ').slice(-1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
