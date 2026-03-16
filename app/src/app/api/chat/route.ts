import Anthropic from '@anthropic-ai/sdk'
import { loadAgent } from '@/lib/agents'
import type { Message } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  const { agentId, messages }: { agentId: string; messages: Message[] } = await req.json()

  const agent = loadAgent(agentId)
  if (!agent) {
    return new Response(JSON.stringify({ error: 'Agent not found' }), { status: 404 })
  }

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: agent.content,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
    cancel() {
      stream.controller.abort()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
