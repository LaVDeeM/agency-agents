import Anthropic from '@anthropic-ai/sdk'
import { loadAgents } from '@/lib/agents'
import type { AgentPerspective, ActionItem, DimensionScore, AnalysisReport } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Per-agent focus prompts ──────────────────────────────────────────────────

function buildAgentPrompt(agentId: string, contextText: string, imageBlocks: Anthropic.ImageBlockParam[]): {
  systemPrompt: string
  userContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[]
} {
  const focusMap: Record<string, string> = {
    'growth-coach': `Focus exclusively on: account health score, growth trajectory, content strategy alignment, optimal posting cadence, 30-day quick wins, and 90-day milestones. Evaluate whether the creator is on the right path to hit their goals.`,
    'performance-analyst': `Focus exclusively on: engagement rate benchmarks, content type performance breakdown, hook effectiveness signals, estimated reach potential, what's working vs. underperforming, and specific metrics to improve.`,
    'viral-architect': `Focus exclusively on: hook quality, trend alignment, caption psychology, hashtag strategy, content format optimization, viral potential rating, and the single most important content change to make immediately.`,
    'audience-intel': `Focus exclusively on: audience fit assessment, psychographic alignment, community trust signals, superfan potential, content-to-audience mismatch risks, and how well the content speaks to the target demographic.`,
    'brand-deal': `Focus exclusively on: monetization readiness score, current brand appeal, rate card estimate, media kit gaps, ideal brand categories, and what needs to change to land the first (or next) brand deal within 90 days.`,
  }

  const focus = focusMap[agentId] || 'Provide your specialist perspective on this creator.'

  const userContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = [
    ...imageBlocks,
    {
      type: 'text',
      text: `${contextText}

Your specific focus for this analysis:
${focus}

IMPORTANT — Respond ONLY with a valid JSON object. No markdown, no explanation, just JSON:
{
  "headline": "One punchy sentence summarizing your specialist verdict (max 15 words)",
  "score": <integer 0-100 representing overall quality from your specialist perspective>,
  "keyFindings": [
    "Finding 1 — specific, factual, tied to the data provided",
    "Finding 2",
    "Finding 3"
  ],
  "recommendations": [
    {
      "action": "Specific action the creator should take",
      "detail": "Why and how to do it",
      "priority": "immediate",
      "impact": "high",
      "effort": "low"
    },
    {
      "action": "Second recommendation",
      "detail": "Context",
      "priority": "next",
      "impact": "medium",
      "effort": "medium"
    },
    {
      "action": "Third recommendation",
      "detail": "Context",
      "priority": "strategic",
      "impact": "high",
      "effort": "high"
    }
  ]
}

priority must be one of: "immediate", "next", "strategic"
impact and effort must be one of: "high", "medium", "low"`,
    },
  ]

  return { systemPrompt: '', userContent }
}

function buildDimensionScores(perspectives: AgentPerspective[]): DimensionScore[] {
  const scoreMap: Record<string, { sum: number; count: number; note: string }> = {
    'Content Quality': { sum: 0, count: 0, note: '' },
    'Hook Strength': { sum: 0, count: 0, note: '' },
    'Audience Alignment': { sum: 0, count: 0, note: '' },
    'Growth Momentum': { sum: 0, count: 0, note: '' },
    'Monetization Readiness': { sum: 0, count: 0, note: '' },
  }

  const agentDimMap: Record<string, string[]> = {
    'growth-coach': ['Content Quality', 'Growth Momentum'],
    'performance-analyst': ['Content Quality', 'Hook Strength'],
    'viral-architect': ['Hook Strength', 'Content Quality'],
    'audience-intel': ['Audience Alignment'],
    'brand-deal': ['Monetization Readiness'],
  }

  for (const p of perspectives) {
    const dims = agentDimMap[p.agentId] || []
    for (const dim of dims) {
      scoreMap[dim].sum += p.score
      scoreMap[dim].count += 1
    }
  }

  // Fallback to overall average for unmapped
  const overallAvg = Math.round(perspectives.reduce((s, p) => s + p.score, 0) / (perspectives.length || 1))

  return Object.entries(scoreMap).map(([label, { sum, count }]) => ({
    label,
    score: count > 0 ? Math.round(sum / count) : overallAvg,
    note: '',
  }))
}

function scoreTier(score: number): AnalysisReport['tier'] {
  if (score >= 80) return 'Viral Potential'
  if (score >= 65) return 'Strong Potential'
  if (score >= 45) return 'Average'
  return 'Needs Work'
}

// ─── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json()
  const { type, accountData, insightsData, reportId } = body

  // Build context text
  let contextText = ''
  const imageBlocks: Anthropic.ImageBlockParam[] = []

  if (type === 'account') {
    const d = accountData
    contextText = `CREATOR ACCOUNT ANALYSIS REQUEST

Platform: ${d.platform ?? 'Instagram'}
Handle: @${d.handle}
Niche: ${d.niche}
Target Audience: ${d.targetAudience}

Key Metrics:
- Followers: ${Number(d.followers).toLocaleString()}
- Avg Engagement Rate: ${d.avgEngagementRate}%
- Content Mix: ${d.contentMix || 'Not specified'}
- Posting Frequency: ${d.postingFrequency || 'Not specified'}
- Account Age: ${d.accountAge || 'Not specified'}
- Recent Growth: ${d.previousGrowth || 'Not specified'}

Top Performing Post: ${d.topPostDescription || 'Not provided'}
Worst Performing Post: ${d.worstPostDescription || 'Not provided'}
Current Goals: ${d.currentGoals || 'Grow audience and engagement'}
`
  } else if (type === 'insights') {
    const d = insightsData
    contextText = `INSTAGRAM INSIGHTS ANALYSIS REQUEST

Platform: ${d.platform ?? 'Instagram'}
Handle: @${d.handle}
Niche: ${d.niche}
Target Audience: ${d.targetAudience}
Current Goals: ${d.currentGoals || 'Optimize performance and grow'}
Additional Context: ${d.additionalContext || 'None'}

Note: Insights screenshots are attached as images. Analyze the visible metrics carefully.
`
    if (d.insightsImages && d.insightsImages.length > 0) {
      for (let i = 0; i < Math.min(d.insightsImages.length, 6); i++) {
        const base64 = d.insightsImages[i].replace(/^data:image\/\w+;base64,/, '')
        const mimeMatch = d.insightsImages[i].match(/^data:(image\/\w+);base64,/)
        const mimeType = (mimeMatch?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
        imageBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: base64 },
        })
      }
    }
  }

  const agents = loadAgents()

  // ── Call all 5 agents in parallel ──────────────────────────────────────────
  const agentCalls = agents.map(async (agent) => {
    const { userContent } = buildAgentPrompt(agent.id, contextText, imageBlocks)

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: agent.content,
        messages: [{ role: 'user', content: userContent }],
      })

      const raw = response.content[0].type === 'text' ? response.content[0].text : ''

      // Extract JSON from response (handle any markdown wrapping)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const parsed = JSON.parse(jsonMatch[0])

      const perspective: AgentPerspective = {
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        agentColor: agent.color,
        headline: parsed.headline ?? 'Analysis complete.',
        score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 60,
        keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings.slice(0, 5) : [],
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.slice(0, 3).map((r: ActionItem) => ({
              action: r.action ?? '',
              detail: r.detail ?? '',
              priority: (['immediate', 'next', 'strategic'] as const).includes(r.priority as 'immediate') ? r.priority : 'next',
              impact: (['high', 'medium', 'low'] as const).includes(r.impact as 'high') ? r.impact : 'medium',
              effort: (['high', 'medium', 'low'] as const).includes(r.effort as 'high') ? r.effort : 'medium',
            }))
          : [],
      }
      return perspective
    } catch {
      // Return fallback perspective on error
      return {
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        agentColor: agent.color,
        headline: 'Analysis temporarily unavailable.',
        score: 50,
        keyFindings: ['Could not retrieve analysis for this specialist.'],
        recommendations: [],
      } as AgentPerspective
    }
  })

  const specialists = await Promise.all(agentCalls)

  // ── Build consolidated report ───────────────────────────────────────────────
  const overallScore = Math.round(specialists.reduce((s, p) => s + p.score, 0) / specialists.length)
  const tier = scoreTier(overallScore)

  // Collect all action items by priority
  const allItems = specialists.flatMap((p) => p.recommendations)
  const immediate = allItems.filter((a) => a.priority === 'immediate').slice(0, 4)
  const next = allItems.filter((a) => a.priority === 'next').slice(0, 4)
  const strategic = allItems.filter((a) => a.priority === 'strategic').slice(0, 4)

  // Build executive summary from top findings across specialists
  const executiveSummary = specialists
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => p.keyFindings[0])
    .filter(Boolean)

  const dimensionScores = buildDimensionScores(specialists)

  const id = reportId || `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  const report: AnalysisReport = {
    id,
    type: type === 'account' ? 'account_analysis' : 'insights_analysis',
    createdAt: new Date().toISOString(),
    title: type === 'account'
      ? `@${accountData?.handle ?? 'account'} Account Analysis`
      : `Insights Analysis · ${insightsData?.handle ?? 'account'}`,
    overallScore,
    tier,
    platform: type === 'account' ? accountData?.platform : insightsData?.platform,
    niche: type === 'account' ? accountData?.niche : insightsData?.niche,
    handle: type === 'account' ? accountData?.handle : insightsData?.handle,
    executiveSummary,
    specialists,
    actionPlan: { immediate, next, strategic },
    dimensionScores,
  }

  return Response.json(report)
}
