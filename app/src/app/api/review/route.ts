import Anthropic from '@anthropic-ai/sdk'
import type { VideoReviewRequest } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const REVIEW_SYSTEM_PROMPT = `You are an elite short-form video strategist and content performance expert combining the expertise of:

1. **Content Performance Analyst** — You score content using data-driven frameworks: hook effectiveness, retention signals, pacing, energy, text overlay quality, and estimated engagement tier.
2. **Viral Content Architect** — You know all proven hook formulas, understand what makes content explode algorithmically, and can prescribe exact optimization changes.
3. **Audience Psychology Specialist** — You read emotional resonance, storytelling arcs, and whether the content will genuinely connect with its target audience.

You receive multiple video frames extracted at regular intervals throughout the video, giving you visibility into the full arc: opening hook, middle build, and closing CTA.

Your reviews are:
- Specific (tied to what you actually see in the frames)
- Honest (no flattery, no generic advice)
- Actionable (every recommendation has a clear "do this" step)
- Structured (clean markdown, scannable sections, clear scores)

Format your response with clean markdown and clear section headers. Use scores as X/10 where relevant.`

function buildReviewPrompt(req: VideoReviewRequest): string {
  const platformLabel = {
    tiktok: 'TikTok',
    instagram: 'Instagram Reels',
    youtube: 'YouTube Shorts',
    other: 'short-form video',
  }[req.platform]

  const durationNote = req.videoDurationSec
    ? `Video-Länge: ${req.videoDurationSec} Sekunden (${
        req.videoDurationSec <= 15 ? 'sehr kurz' :
        req.videoDurationSec <= 30 ? 'kurz' :
        req.videoDurationSec <= 60 ? 'standard' : 'lang'
      })`
    : ''

  return `Analysiere dieses ${platformLabel}-Video. Ich liefere dir ${req.frames.length} gleichmäßig verteilte Key-Frames, die den gesamten zeitlichen Verlauf des Videos abdecken.

**Creator-Kontext:**
- Platform: ${platformLabel}
- ${durationNote}
- Nische / Thema: ${req.niche}
- Zielgruppe: ${req.audience}
- Ziel des Videos: ${req.goal || 'Follower & Engagement wachsen lassen'}
${req.audioContext ? `- Audio / Sound: ${req.audioContext}` : ''}
${req.captionText ? `- Caption / Beschreibung: ${req.captionText}` : ''}

Erstelle einen vollständigen Professional-Review mit diesen Sektionen:

---

## 🎯 Gesamtbewertung

**Viral-Potenzial:** [Gering / Durchschnittlich / Stark / Viral-Potenzial]
**Gesamt-Score: X/10**

Schreibe ein 2–3-Satz-Urteil: Was ist die ehrliche Einschätzung des Videos? Was ist die stärkste und schwächste Eigenschaft?

---

## 🪝 Hook-Analyse: X/10

Analysiere Frame 1 (die Eröffnung) und Frame 2 (erste 15% des Videos):
- **Hook-Formel:** Welcher Hook-Typ wird verwendet (oder versucht)?
- **Was funktioniert:** [Konkret]
- **Was fehlt oder schwächt:** [Konkret]
- **Scroll-Stopp-Faktor:** Würde ein Nutzer in 0.5 Sekunden stoppen? Warum / warum nicht?

---

## 📖 Storytelling-Arc: X/10

Analysiere den Aufbau über alle ${req.frames.length} Frames:
- **Struktur:** Gibt es einen klaren Anfang → Mitte → Schluss?
- **Spannungsverlauf:** Wo steigt das Interesse, wo droht der Drop-off?
- **Informationsdichte:** Zu viel, zu wenig, oder gut dosiert?
- **Emotionale Resonanz:** Löst das Video eine klare Emotion aus?

---

## ⚡ Pacing & Visuelle Dynamik: X/10

Basierend auf dem visuellen Fortschritt zwischen den Frames:
- **Schnittgeschwindigkeit:** Zu schnell / zu langsam / passend für ${platformLabel}?
- **Visuelle Abwechslung:** Ändern sich Kameraperspektiven, Szenen, Grafiken?
- **Energie-Level:** Passt die Energie zu Plattform und Zielgruppe?
- **Bewegungsdynamik:** Statisch oder dynamisch?

---

## 🎵 Audio & Sound-Analyse

${req.audioContext
  ? `Basierend auf der Beschreibung: "${req.audioContext}"`
  : `Hinweis: Kein Audio-Kontext wurde bereitgestellt. Empfehle auf Basis der visuellen Signale.`
}
- **Sound-Strategie:** Wie gut unterstützt das Audio den Content?
- **Musik-Trend-Fit:** Ist der Sound trending oder veraltet?
- **Voice / Voiceover:** Falls erkennbar — klar, präsent, überzeugend?
- **Sound-Empfehlung:** Was würde den Audio-Impact steigern?

---

## 📝 Text-Overlay & Caption-Audit

Bewerte alle sichtbaren Text-Einblendungen und die bereitgestellte Caption:
- **Lesbarkeit:** Schriftgröße, Kontrast, Positionierung
- **Timing-Feedback:** Erscheinen Texte zur richtigen Zeit?
- **Value-Add:** Ergänzen die Texte den Content oder überladen sie ihn?
${req.captionText ? `- **Caption-Bewertung:** Ist die Caption klar, keyword-stark, mit gutem CTA?` : ''}

---

## 📣 Call-to-Action & Retention-Ende: X/10

Analysiere die letzten Frames (Frame ${req.frames.length - 1} und ${req.frames.length}):
- **CTA-Qualität:** Gibt es einen klaren Aufruf? Welcher Typ (Follow, Kommentieren, Speichern, Link)?
- **Loop-Faktor:** Endet das Video so, dass man es nochmal ansehen will?
- **Abschluss-Stärke:** Stark oder flaues Ende?

---

## 🔥 Viralitäts- & Reichweiten-Einschätzung: X/10

- **Algorithmus-Signale:** Was begünstigt / benachteiligt Reichweite?
- **Share-Worthiness:** Würde jemand das teilen? Warum?
- **Save-Trigger:** Gibt es einen Grund zum Speichern?
- **Kommentar-Anreiz:** Regt das Video zur Interaktion an?
- **Nischen-Fit:** Passt der Content perfekt zur Zielgruppe?

---

## 🖼️ Bester Thumbnail-Frame

Welcher Frame (1–${req.frames.length}) eignet sich am besten als Cover-Bild und warum?

---

## 🔝 Top 5 Sofort-Maßnahmen

Priorisierte, sofort umsetzbare Änderungen — vor dem Posten:

1. **[HÖCHSTE PRIORITÄT]** [Was genau tun] — [Warum das den größten Impact hat]
2. [Konkrete Maßnahme] — [Begründung]
3. [Konkrete Maßnahme] — [Begründung]
4. [Konkrete Maßnahme] — [Begründung]
5. [Konkrete Maßnahme] — [Begründung]

---

## ✍️ Optimierter Hook-Entwurf

Falls der Hook stärker sein könnte — beschreibe ein alternatives Opening für die ersten 1–3 Sekunden, das auf ${platformLabel} besser performen würde. Konkret: Was zeigen, was sagen, welcher Text?`
}

export async function POST(req: Request) {
  const body: VideoReviewRequest = await req.json()

  if (!body.frames || body.frames.length === 0) {
    return new Response(JSON.stringify({ error: 'No frames provided' }), { status: 400 })
  }

  // Build interleaved image + label blocks
  const interleavedBlocks: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = []
  for (let i = 0; i < body.frames.length; i++) {
    const base64Data = body.frames[i].replace(/^data:image\/\w+;base64,/, '')
    const pct = Math.round((i / (body.frames.length - 1 || 1)) * 100)
    interleavedBlocks.push({ type: 'text', text: `Frame ${i + 1} von ${body.frames.length} (bei ${pct}% des Videos):` })
    interleavedBlocks.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: base64Data },
    })
  }

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: REVIEW_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          ...interleavedBlocks,
          { type: 'text', text: buildReviewPrompt(body) },
        ],
      },
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
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
