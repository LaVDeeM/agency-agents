export interface Agent {
  id: string
  name: string
  description: string
  color: string
  emoji: string
  vibe: string
  content: string // full markdown — used as system prompt
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface VideoReviewRequest {
  frames: string[]   // base64 JPEG data URLs
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other'
  niche: string
  audience: string
  goal: string
  audioContext?: string   // user-described audio/music/voice
  captionText?: string    // video caption/description
  videoTitle?: string
  videoDurationSec?: number
}

export interface AccountAnalysisRequest {
  handle: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  followers: number
  avgEngagementRate: number
  niche: string
  targetAudience: string
  contentMix?: string           // e.g. "70% Reels, 20% Carousels, 10% Stories"
  postingFrequency?: string     // e.g. "3x/week"
  topPostDescription?: string   // describe a recent top performer
  worstPostDescription?: string
  currentGoals?: string         // e.g. "grow to 50K, land first brand deal"
  accountAge?: string           // e.g. "8 months"
  previousGrowth?: string       // e.g. "+500 followers/month"
}

export interface InsightsAnalysisRequest {
  handle: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  niche: string
  targetAudience: string
  insightsImages: string[]      // base64 screenshots of insights
  additionalContext?: string
  currentGoals?: string
}

// --- Multi-Agent Analysis ---

export interface AgentPerspective {
  agentId: string
  agentName: string
  agentEmoji: string
  agentColor: string
  headline: string
  score: number            // 0–100
  keyFindings: string[]
  recommendations: ActionItem[]
}

export interface ActionItem {
  action: string
  detail?: string
  priority: 'immediate' | 'next' | 'strategic'
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
}

export interface DimensionScore {
  label: string
  score: number   // 0–100
  note: string
}

export interface AnalysisReport {
  id: string
  type: 'reel_review' | 'account_analysis' | 'insights_analysis'
  createdAt: string
  title: string
  overallScore: number
  tier: 'Viral Potential' | 'Strong Potential' | 'Average' | 'Needs Work'
  platform?: string
  niche?: string
  handle?: string
  executiveSummary: string[]
  specialists: AgentPerspective[]
  actionPlan: {
    immediate: ActionItem[]
    next: ActionItem[]
    strategic: ActionItem[]
  }
  dimensionScores: DimensionScore[]
  rawMarkdown?: string        // fallback full markdown output
  inputFrames?: string[]      // thumbnail previews
  chatHistory?: Message[]
}

// --- Saved Report (localStorage) ---

export interface SavedReport {
  id: string
  type: 'reel_review' | 'account_analysis' | 'insights_analysis'
  createdAt: string
  title: string
  summary: string
  overallScore: number
  tier: string
  niche?: string
  handle?: string
  platform?: string
  report: AnalysisReport
  inputFrames?: string[]
}

// --- Quick Prompts ---

export const QUICK_PROMPTS: Record<string, string[]> = {
  'growth-coach': [
    'Audit my account: I have [X] followers on Instagram with [Y]% engagement. My niche is [topic]. What are my top 3 blockers?',
    'Build me a 30-day growth roadmap for a [niche] creator currently at 5,000 followers.',
    'Why would a creator who posts 4x/week consistently still not be growing? Walk me through the most common causes.',
    'What content pillars should a [niche] creator focus on to build niche authority fast?',
  ],
  'performance-analyst': [
    'My best post got 80K views and my worst got 300. Here\'s what was different: [describe both]. Why the gap?',
    'What\'s a good engagement rate benchmark for a fitness creator with 15,000 Instagram followers?',
    'Score my content strategy: I post Reels 3x/week, carousels 2x/week, no Stories. Engagement averages 2.8%. What\'s missing?',
    'Design 3 A/B content experiments I should run next month to improve my hook completion rate.',
  ],
  'viral-architect': [
    'Write 5 different hooks for a reel about [topic] — use your proven hook formula library.',
    'Build a full content blueprint for a reel about sustainable morning routines: hook, structure, caption, hashtags.',
    'Which trends should a home décor creator join this week and how do I make them feel native to my niche?',
    'Give me a 30-day content calendar for a fitness creator posting 5x/week on TikTok.',
  ],
  'audience-intel': [
    'Profile my audience: 70% female, age 25–34, interests: wellness, minimalism, sustainability. What are their core fears and aspirations?',
    'My audience loves tutorial content but drops off after 15 seconds on storytelling videos. What does that behavioral pattern tell you?',
    'Build me a superfan cultivation system for a personal finance creator with 8,000 followers.',
    'What\'s my niche authority positioning if my content covers sustainable fashion, conscious consumerism, and ethical living?',
  ],
  'brand-deal': [
    'What should I charge per sponsored reel with 12,000 Instagram followers and 4.2% engagement in the wellness niche?',
    'Write the hero section of my media kit. My stats: 12K Instagram, 8K TikTok, 4.2% avg engagement, audience: 28–35 female professionals.',
    'A brand offered me $200 per post. My rate is $800. Walk me through the negotiation.',
    'Write a cold outreach email to Patagonia — I\'m a sustainable fashion creator with 15K followers who genuinely uses their products.',
  ],
}
