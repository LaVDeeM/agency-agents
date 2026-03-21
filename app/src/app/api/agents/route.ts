import { loadAgents } from '@/lib/agents'
import type { Agent } from '@/lib/types'

export async function GET() {
  try {
    const agents = loadAgents()
    // Return agents without the full content for listing (content stays server-side)
    const slim = agents.map(({ id, name, description, color, emoji, vibe }) => ({
      id, name, description, color, emoji, vibe, content: '',
    })) satisfies Agent[]
    return Response.json(slim)
  } catch (err) {
    return Response.json({ error: 'Failed to load agents' }, { status: 500 })
  }
}
