'use client'

import { useState } from 'react'
import type { AnalysisReport, ActionItem, AudienceHypothesis, AudioAnalysis } from '@/lib/types'

interface Props {
  report: AnalysisReport
  onSave?: () => void
  onChat?: (agentId: string) => void
  inputFrames?: string[]
}

// ── Tier Config ───────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { color: string; bg: string; dot: string; icon: string }> = {
  'Viral Potential':  { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-400', icon: '🚀' },
  'Strong Potential': { color: 'text-indigo-400',  bg: 'bg-indigo-500/15 border-indigo-500/30',   dot: 'bg-indigo-400',  icon: '📈' },
  'Average':          { color: 'text-yellow-400',  bg: 'bg-yellow-500/15 border-yellow-500/30',   dot: 'bg-yellow-400',  icon: '⚡' },
  'Needs Work':       { color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/30',         dot: 'bg-red-400',     icon: '🔧' },
}

const PRIORITY_CONFIG = {
  immediate: { label: 'Sofort', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  next:      { label: 'Als Nächstes', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', text: 'text-indigo-400', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
  strategic: { label: 'Strategisch', bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
}

const IMPACT_COLOR = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-emerald-400' }
const EFFORT_COLOR = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-emerald-400' }
const CONFIDENCE_COLOR = { low: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', medium: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25', high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' }

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circ = 2 * Math.PI * radius
  const filled = (score / 100) * circ
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#6366f1' : score >= 35 ? '#f59e0b' : '#f87171'
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  )
}

function ScoreBar({ score, color = '#6366f1' }: { score: number; color?: string }) {
  const barColor = score >= 75 ? '#34d399' : score >= 50 ? color : score >= 35 ? '#f59e0b' : '#f87171'
  return (
    <div className="h-1.5 w-full rounded-full bg-white/6 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barColor }} />
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/6 text-base">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function ActionCard({ item }: { item: ActionItem }) {
  const cfg = PRIORITY_CONFIG[item.priority]
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <div className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>{cfg.label}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white leading-snug">{item.action}</p>
          {item.detail && <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{item.detail}</p>}
          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              Impact: <span className={`font-medium ${IMPACT_COLOR[item.impact]}`}>{item.impact}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              Aufwand: <span className={`font-medium ${EFFORT_COLOR[item.effort]}`}>{item.effort}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AudienceHypothesisSection({ data }: { data: AudienceHypothesis }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader icon="🧠" title="Zielgruppen-Hypothese" subtitle="KI-generierte Einschätzung" />
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${CONFIDENCE_COLOR[data.confidenceLevel]}`}>
          {data.confidenceLevel === 'high' ? 'Hohe Konfidenz' : data.confidenceLevel === 'medium' ? 'Mittlere Konfidenz' : 'Hypothese'} · AI
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/3 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Kern-Zielgruppe</div>
          <p className="text-sm text-white leading-relaxed">{data.corePrimary}</p>
          {data.ageCluster && (
            <p className="mt-1 text-xs text-gray-500">Alterscluster: <span className="text-gray-300">{data.ageCluster}</span></p>
          )}
        </div>

        {data.secondaryAudience && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sekundär-Zielgruppe</div>
            <p className="text-sm text-white leading-relaxed">{data.secondaryAudience}</p>
          </div>
        )}

        {data.interestClusters.length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Interessencluster</div>
            <div className="flex flex-wrap gap-1.5">
              {data.interestClusters.map((c, i) => (
                <span key={i} className="rounded-full bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-0.5 text-xs text-indigo-300">{c}</span>
              ))}
            </div>
          </div>
        )}

        {data.consumptionMotivation && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Konsummotiv</div>
            <p className="text-sm text-gray-300 leading-relaxed">{data.consumptionMotivation}</p>
          </div>
        )}

        {data.brandFitSuggestions && data.brandFitSuggestions.length > 0 && (
          <div className="sm:col-span-2 rounded-xl border border-white/8 bg-white/3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Mögliche Brand-Partner-Kategorien</div>
            <div className="flex flex-wrap gap-1.5">
              {data.brandFitSuggestions.map((b, i) => (
                <span key={i} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs text-amber-300">{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AudioAnalysisSection({ data }: { data: AudioAnalysis }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
      <SectionHeader icon="🎵" title="Audio-Analyse" subtitle="Sprache · Musik · Ton" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-4 py-3">
          <span className="text-xs text-gray-400">Voiceover erkannt</span>
          <span className={`text-xs font-semibold ${data.voiceoverDetected ? 'text-emerald-400' : 'text-gray-500'}`}>
            {data.voiceoverDetected ? '✓ Ja' : '✗ Nein'}
          </span>
        </div>
        {data.overallAudioScore !== undefined && (
          <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-4 py-3">
            <span className="text-xs text-gray-400">Audio-Score</span>
            <span className="text-sm font-bold text-white">{data.overallAudioScore}/100</span>
          </div>
        )}
        {data.tonality && (
          <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">Tonalität</div>
            <div className="text-sm text-white">{data.tonality}</div>
          </div>
        )}
        {data.musicCharacter && (
          <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">Musik / Sound</div>
            <div className="text-sm text-white">{data.musicCharacter}</div>
          </div>
        )}
        {data.hookOnAudio && (
          <div className="sm:col-span-2 rounded-lg border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">Hook (Audio)</div>
            <div className="text-sm text-gray-300 leading-relaxed">{data.hookOnAudio}</div>
          </div>
        )}
        {data.audioVisualFit && (
          <div className="sm:col-span-2 rounded-lg border border-white/8 bg-white/3 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">Audio-Visual-Fit</div>
            <div className="text-sm text-gray-300 leading-relaxed">{data.audioVisualFit}</div>
          </div>
        )}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Audio-Empfehlungen</div>
            <ul className="space-y-1.5">
              {data.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StructuredReport({ report, onSave, onChat, inputFrames }: Props) {
  const [activeSpecialist, setActiveSpecialist] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'specialists' | 'scores'>('overview')
  const tierCfg = TIER_CONFIG[report.tier] ?? TIER_CONFIG['Average']

  const quickWins = report.quickWins?.length ? report.quickWins : report.actionPlan.immediate.slice(0, 3).map(a => a.action)
  const risks = report.risks?.length ? report.risks : []
  const hasAudienceHypothesis = !!report.audienceHypothesis || report.specialists.some(s => s.audienceHypothesis)
  const audienceHypothesis = report.audienceHypothesis ?? report.specialists.find(s => s.audienceHypothesis)?.audienceHypothesis

  return (
    <div className="space-y-5">

      {/* ── HERO CARD ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden">
        {/* Top accent */}
        <div className={`h-1 w-full bg-gradient-to-r ${
          report.tier === 'Viral Potential' ? 'from-emerald-500 to-teal-500' :
          report.tier === 'Strong Potential' ? 'from-indigo-500 to-purple-500' :
          report.tier === 'Average' ? 'from-yellow-500 to-amber-500' :
          'from-red-500 to-rose-500'
        }`} />

        <div className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Title & Summary */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tierCfg.bg} ${tierCfg.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tierCfg.dot}`} />
                  {tierCfg.icon} {report.tier}
                </span>
                {report.platform && (
                  <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-gray-400">{report.platform}</span>
                )}
                {report.niche && (
                  <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-gray-400">{report.niche}</span>
                )}
                {report.handle && (
                  <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-gray-400">@{report.handle}</span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white leading-tight">{report.title}</h2>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(report.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                {report.specialists.length > 0 && ` · ${report.specialists.length} Spezialisten`}
              </p>

              {/* Executive Summary */}
              {report.executiveSummary.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  {report.executiveSummary.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 text-indigo-400 text-xs font-bold">◆</span>
                      <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Score Ring */}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={report.overallScore} size={96} />
                <div className="absolute text-center">
                  <div className={`text-2xl font-bold leading-none ${tierCfg.color}`}>{report.overallScore}</div>
                  <div className="text-xs text-gray-600">/100</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Gesamt-Score</div>
            </div>
          </div>

          {/* Specialist Score Row */}
          {report.specialists.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/8 pt-5">
              {report.specialists.map((s) => (
                <div key={s.agentId} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md text-xs" style={{ backgroundColor: `${s.agentColor}25` }}>
                    {s.agentEmoji}
                  </div>
                  <span className="text-xs text-gray-400">{s.agentName.split(' ').pop()}</span>
                  <span className={`text-xs font-bold ${s.score >= 70 ? 'text-emerald-400' : s.score >= 50 ? 'text-indigo-400' : 'text-yellow-400'}`}>{s.score}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {(onSave || onChat) && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
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
                  💬 Mit Growth Coach chatten
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── VIDEO FRAMES ──────────────────────────────────────────────── */}
      {inputFrames && inputFrames.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {inputFrames.map((url, i) => (
            <img key={i} src={url} alt={`Frame ${i + 1}`} className="h-20 w-auto shrink-0 rounded-lg object-cover border border-white/10" />
          ))}
        </div>
      )}

      {/* ── NAVIGATION TABS ───────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1">
        {(['overview', 'plan', 'specialists', 'scores'] as const).map((tab) => {
          const labels = { overview: '📋 Übersicht', plan: '🎯 Aktionsplan', specialists: '🤖 Spezialisten', scores: '📊 Scores' }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* ── TAB: OVERVIEW ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-5">
              <SectionHeader icon="⚡" title="Quick Wins" subtitle="Sofort umsetzbar, hoher Impact" />
              <ul className="space-y-2.5">
                {quickWins.map((w, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">{i + 1}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{w}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Audience Hypothesis */}
          {hasAudienceHypothesis && audienceHypothesis && (
            <AudienceHypothesisSection data={audienceHypothesis} />
          )}

          {/* Audio Analysis */}
          {report.audioAnalysis && (
            <AudioAnalysisSection data={report.audioAnalysis} />
          )}

          {/* Risks */}
          {risks.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-5">
              <SectionHeader icon="⚠️" title="Risiken & Schwächen" />
              <ul className="space-y-2">
                {risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dimension Scores Mini-Grid */}
          {report.dimensionScores.length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <SectionHeader icon="📐" title="Performance-Dimensionen" />
              <div className="space-y-4">
                {report.dimensionScores.map((dim) => (
                  <div key={dim.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm text-gray-300">{dim.label}</span>
                      <span className={`text-sm font-bold ${dim.score >= 70 ? 'text-emerald-400' : dim.score >= 50 ? 'text-indigo-400' : dim.score >= 35 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {dim.score}<span className="text-xs text-gray-600">/100</span>
                      </span>
                    </div>
                    <ScoreBar score={dim.score} />
                    {dim.note && <p className="mt-1 text-xs text-gray-600">{dim.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ACTION PLAN ──────────────────────────────────────────── */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {(['immediate', 'next', 'strategic'] as const).map((priority) => {
            const items = report.actionPlan[priority === 'immediate' ? 'immediate' : priority === 'next' ? 'next' : 'strategic']
            if (!items || items.length === 0) return null
            const cfg = PRIORITY_CONFIG[priority]
            return (
              <div key={priority}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${cfg.badge}`}>{cfg.label}</span>
                  <div className="flex-1 h-px bg-white/6" />
                  <span className="text-xs text-gray-600">{items.length} Maßnahme{items.length > 1 ? 'n' : ''}</span>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => <ActionCard key={i} item={item} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB: SPECIALISTS ──────────────────────────────────────────── */}
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${specialist.agentColor}20` }}>
                    {specialist.agentEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">{specialist.agentName}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">{specialist.headline}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${specialist.score >= 70 ? 'text-emerald-400' : specialist.score >= 50 ? 'text-indigo-400' : 'text-yellow-400'}`}>{specialist.score}</div>
                      <div className="text-xs text-gray-600">/100</div>
                    </div>
                    <div className="w-16">
                      <ScoreBar score={specialist.score} color={specialist.agentColor} />
                    </div>
                    <svg className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/8 px-5 py-5 space-y-5">
                    {/* Headline */}
                    <p className="text-sm text-gray-200 leading-relaxed italic">"{specialist.headline}"</p>

                    {/* Key Findings */}
                    <div>
                      <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Key Findings</div>
                      <ul className="space-y-2">
                        {specialist.keyFindings.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
                            <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: specialist.agentColor }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Audience Hypothesis from this specialist */}
                    {specialist.audienceHypothesis && (
                      <div>
                        <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Zielgruppen-Hypothese</div>
                        <div className="rounded-xl border border-teal-500/20 bg-teal-500/8 p-4">
                          <p className="text-sm text-gray-200 leading-relaxed">{specialist.audienceHypothesis.corePrimary}</p>
                          {specialist.audienceHypothesis.interestClusters.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {specialist.audienceHypothesis.interestClusters.map((c, i) => (
                                <span key={i} className="rounded-full bg-teal-500/15 px-2 py-0.5 text-xs text-teal-300">{c}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {specialist.recommendations.length > 0 && (
                      <div>
                        <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Empfehlungen</div>
                        <div className="space-y-2">
                          {specialist.recommendations.map((r, i) => (
                            <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-3">
                              <p className="text-sm font-medium text-white">{r.action}</p>
                              {r.detail && <p className="mt-1 text-xs text-gray-400 leading-relaxed">{r.detail}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {onChat && (
                      <button
                        onClick={() => onChat(specialist.agentId)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:text-white hover:bg-white/5"
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

      {/* ── TAB: SCORES ───────────────────────────────────────────────── */}
      {activeTab === 'scores' && (
        <div className="space-y-5">
          {/* Dimension Scores */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <SectionHeader icon="📐" title="Performance-Dimensionen" />
            <div className="space-y-5">
              {report.dimensionScores.map((dim) => (
                <div key={dim.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-gray-300">{dim.label}</span>
                    <span className="text-sm font-bold text-white">{dim.score}/100</span>
                  </div>
                  <ScoreBar score={dim.score} />
                  {dim.note && <p className="mt-1 text-xs text-gray-500">{dim.note}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Specialist Score Grid */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <SectionHeader icon="🤖" title="Spezialist-Scores" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {report.specialists.map((s) => (
                <div key={s.agentId} className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${s.agentColor}25` }}>
                    {s.agentEmoji}
                  </div>
                  <div className="relative flex items-center justify-center">
                    <ScoreRing score={s.score} size={52} />
                    <div className="absolute text-center">
                      <div className={`text-xs font-bold leading-none ${s.score >= 70 ? 'text-emerald-400' : s.score >= 50 ? 'text-indigo-400' : 'text-yellow-400'}`}>{s.score}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 leading-tight">{s.agentName.split(' ').slice(-1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Score Summary */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-5 flex items-center gap-5">
            <div className="relative flex items-center justify-center shrink-0">
              <ScoreRing score={report.overallScore} size={72} />
              <div className="absolute text-center">
                <div className={`text-lg font-bold leading-none ${tierCfg.color}`}>{report.overallScore}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Gesamt-Score</div>
              <div className={`text-lg font-bold ${tierCfg.color}`}>{report.tier}</div>
              <p className="mt-1 text-xs text-gray-400">
                Durchschnitt aus {report.specialists.length} Spezialist-Perspektiven
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
