import Anthropic from '@anthropic-ai/sdk'
import type { VideoReviewRequest } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const REVIEW_SYSTEM_PROMPT = `You are an elite social media content strategist combining the expertise of two specialists:

1. **Content Performance Analyst** — You score content using data-driven frameworks: hook effectiveness, visual retention signals, pacing, text overlay quality, and estimated engagement tier.

2. **Viral Content Architect** — You know all 15 proven hook formulas, understand what makes content explode algorithmically, and can prescribe exact optimization changes.

When reviewing video frames from a creator's reel or TikTok, you deliver a professional, structured review that is honest, specific, and immediately actionable. You don't give generic advice — every recommendation ties back to what you actually see in the frames provided.

Format your response in clean markdown with clear section headers.`

function buildReviewPrompt(req: VideoReviewRequest): string {
  const platformLabel =
    req.platform === 'tiktok'
      ? 'TikTok'
      : req.platform === 'instagram'
      ? 'Instagram Reels'
      : req.platform === 'youtube'
      ? 'YouTube Shorts'
      : 'short-form video'

  return `Please review this ${platformLabel} video. I'm providing ${req.frames.length} key frames extracted from the video (at equal intervals).

**Creator Context:**
- Platform: ${platformLabel}
- Niche / Topic: ${req.niche}
- Target Audience: ${req.audience}
- Goal of this video: ${req.goal}

Analyze the frames and deliver a full professional review with these sections:

## 🎯 Overall Performance Prediction
Rate the video's viral potential: **Low / Average / Strong / Viral Potential**
Give a 2–3 sentence summary verdict.

## 🪝 Hook Strength Score: X/10
Analyze Frame 1 (the opening). Does it stop the scroll?
- Which of the 15 hook formula types is being used (or attempted)?
- What's working and what's failing in the first second?

## 📖 Visual Storytelling Arc
Analyze how the story or information progresses across the frames.
- Is there a clear beginning → middle → end?
- Where does engagement likely peak or drop?

## ⚡ Pacing & Energy Assessment
Based on visual progression between frames:
- Is pacing too fast, too slow, or well-matched for ${platformLabel}?
- Does the energy level match the platform and audience expectations?

## 📝 Text Overlay Audit
Assess any visible text overlays, captions, or graphics:
- Readability, positioning, timing effectiveness
- Are they adding value or cluttering the frame?

## 🖼️ Best Thumbnail Frame
Which frame number (1–${req.frames.length}) would make the strongest cover image and why?

## 🔝 Top 5 Optimization Actions
Numbered list of specific, immediately actionable changes to make before posting:
1.
2.
3.
4.
5.

## ✍️ Rewritten Hook Concept
If the hook could be stronger, describe an alternative opening concept for the first 1–2 seconds that would perform better on ${platformLabel}.`
}

export async function POST(req: Request) {
  const body: VideoReviewRequest = await req.json()

  if (!body.frames || body.frames.length === 0) {
    return new Response(JSON.stringify({ error: 'No frames provided' }), { status: 400 })
  }

  // Build image content blocks from base64 frames
  const imageBlocks: Anthropic.ImageBlockParam[] = body.frames.map((frame) => {
    // frame is a data URL: "data:image/jpeg;base64,..."
    const base64Data = frame.replace(/^data:image\/\w+;base64,/, '')
    return {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64Data,
      },
    }
  })

  // Label each frame
  const frameLabels: Anthropic.TextBlockParam[] = body.frames.map((_, i) => ({
    type: 'text',
    text: `Frame ${i + 1} of ${body.frames.length} (at ${Math.round((i / (body.frames.length - 1 || 1)) * 100)}% of video):`,
  }))

  // Interleave labels and images: label1, image1, label2, image2, ...
  const interleavedBlocks: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = []
  for (let i = 0; i < body.frames.length; i++) {
    interleavedBlocks.push(frameLabels[i])
    interleavedBlocks.push(imageBlocks[i])
  }

  const prompt = buildReviewPrompt(body)

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: REVIEW_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          ...interleavedBlocks,
          { type: 'text', text: prompt },
        ],
      },
    ],
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
