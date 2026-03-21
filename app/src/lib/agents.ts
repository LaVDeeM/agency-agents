import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Agent } from './types'

const AGENT_FILES = [
  { id: 'growth-coach', file: 'marketing-influencer-growth-coach.md' },
  { id: 'performance-analyst', file: 'marketing-content-performance-analyst.md' },
  { id: 'brand-deal', file: 'marketing-brand-deal-strategist.md' },
  { id: 'viral-architect', file: 'marketing-viral-content-architect.md' },
  { id: 'audience-intel', file: 'marketing-audience-intelligence-agent.md' },
]

// Resolve path to the marketing/ directory (two levels up from app/)
const MARKETING_DIR = path.resolve(process.cwd(), '..', 'marketing')

function parseAgent(id: string, filename: string): Agent {
  const filepath = path.join(MARKETING_DIR, filename)
  const raw = fs.readFileSync(filepath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    id,
    name: data.name ?? id,
    description: data.description ?? '',
    color: data.color ?? '#6366f1',
    emoji: data.emoji ?? '🤖',
    vibe: data.vibe ?? '',
    content: raw, // full file as system prompt (frontmatter + markdown)
  }
}

export function loadAgents(): Agent[] {
  return AGENT_FILES.map(({ id, file }) => parseAgent(id, file))
}

export function loadAgent(id: string): Agent | null {
  const entry = AGENT_FILES.find((a) => a.id === id)
  if (!entry) return null
  return parseAgent(entry.id, entry.file)
}
