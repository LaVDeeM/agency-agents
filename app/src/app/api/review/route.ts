import Anthropic from '@anthropic-ai/sdk'
import type { VideoReviewRequest } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const REVIEW_SYSTEM_PROMPT = `Du bist ein Elite-Stratege für Kurzvideos — eine Kombination aus:

1. **Content Performance Analyst** — Du bewertest Hook-Effektivität, Retention-Signale, Pacing, Energie, Text-Overlays und geschätztes Engagement-Tier mit datenbasierten Frameworks.
2. **Viral Content Architect** — Du kennst alle bewährten Hook-Formeln, verstehst algorithmische Virality und kannst exakte Optimierungen verschreiben.
3. **Audience Psychology Specialist** — Du liest emotionale Resonanz, Storytelling-Arcs, Zielgruppen-Fit und Kaufbereitschaftssignale.
4. **Audio & Voice Strategist** — Du analysierst Sprache, Voiceover, Tonalität, Sprechtempo, Musikcharakter, Hooks auf Audio-Ebene und Audio-Visual-Fit.

Du erhältst mehrere Frames, die den zeitlichen Verlauf des Videos abdecken.

Deine Reviews sind:
- Spezifisch (bezogen auf was du wirklich in den Frames siehst)
- Ehrlich (keine Schmeichelei, keine generischen Ratschläge)
- Handlungsorientiert (jede Empfehlung hat einen klaren "Mach das"-Schritt)
- Strukturiert (klares Markdown, scannbare Sections, klare Scores)

Antworte immer auf Deutsch.`

function buildReviewPrompt(req: VideoReviewRequest): string {
  const platformLabel = {
    tiktok: 'TikTok',
    instagram: 'Instagram Reels',
    youtube: 'YouTube Shorts',
    other: 'Kurzvideo',
  }[req.platform]

  const durationNote = req.videoDurationSec
    ? `Video-Länge: ${req.videoDurationSec}s (${req.videoDurationSec <= 15 ? 'sehr kurz' : req.videoDurationSec <= 30 ? 'kurz' : req.videoDurationSec <= 60 ? 'standard' : 'lang'})`
    : ''

  const accountSection = req.accountContext
    ? `\n**Account-Kontext:**
- Handle: @${req.accountContext.handle}
- Platform: ${req.accountContext.platform}
- Nische: ${req.accountContext.niche}
- Zielgruppe: ${req.accountContext.targetAudience || 'nicht angegeben'}
- Wachstumsphase: ${req.accountContext.growthPhase || 'nicht angegeben'}
- Ziele: ${req.accountContext.goals || 'nicht angegeben'}
`
    : ''

  return `Analysiere dieses ${platformLabel}-Video. Ich liefere dir ${req.frames.length} gleichmäßig verteilte Key-Frames, die den gesamten zeitlichen Verlauf abdecken.

**Creator-Kontext:**
- Platform: ${platformLabel}
- ${durationNote}
- Nische: ${req.niche}
- Zielgruppe: ${req.audience}
- Video-Ziel: ${req.goal || 'Follower & Engagement steigern'}
${req.audioContext ? `- Audio-Beschreibung: ${req.audioContext}` : ''}
${req.captionText ? `- Caption: ${req.captionText}` : ''}
${accountSection}

---

## 🎯 Gesamtbewertung

**Viral-Potenzial:** [Gering / Durchschnittlich / Stark / Viral-Potenzial]
**Gesamt-Score: X/10**

Schreibe ein ehrliches 2–3-Satz-Urteil: Was ist die stärkste und schwächste Eigenschaft dieses Videos?

---

## 🪝 Hook-Analyse: X/10

Analysiere Frame 1–2 (Eröffnung, erste 13% des Videos):
- **Hook-Formel:** Welcher Hook-Typ wird verwendet?
- **Scroll-Stopp-Faktor:** Würde ein Nutzer in 0.5 Sekunden stoppen? Warum / warum nicht?
- **Was funktioniert:** [Konkret]
- **Was fehlt / schwächt:** [Konkret]
- **Hook auf Audio-Ebene:** Gibt es in den ersten 1–3 Sekunden einen verbalen Hook, eine Frage oder ein überraschendes Statement?

---

## 📖 Storytelling-Arc: X/10

Analysiere alle ${req.frames.length} Frames:
- **Struktur:** Klarer Anfang → Mitte → Schluss?
- **Spannungsverlauf:** Wo droht der Drop-off?
- **Informationsdichte:** Gut dosiert?
- **Emotionale Resonanz:** Welche Emotion wird ausgelöst?

---

## ⚡ Pacing & Visuelle Dynamik: X/10

- **Schnittgeschwindigkeit:** Passend für ${platformLabel}?
- **Visuelle Abwechslung:** Perspektiven, Szenen, Grafiken?
- **Energie-Level:** Passt zur Zielgruppe?
- **Bewegungsdynamik:** Statisch oder dynamisch?

---

## 🎵 Audio-Analyse: X/10

${req.audioContext
  ? `**Basierend auf der Beschreibung:** "${req.audioContext}"`
  : `**Hinweis:** Kein Audio-Kontext angegeben. Analyse basiert auf visuellen Signalen.`
}

- **Voiceover erkannt:** [Ja / Nein / Unklar aus Frames]
- **Tonalität:** [z.B. energetisch, entspannt, motivierend, emotional]
- **Musikcharakter:** [z.B. Trending-Sound, Hintergrundmusik, ruhig, energetisch]
- **Audio-Visual-Fit:** Unterstützt der Sound den visuellen Content?
- **Hook auf Audio:** Gibt es in den ersten 3 Sekunden einen verbalen Hook oder auffälligen Sound?
- **CTA im Ton:** Gibt es einen gesprochenen Call-to-Action?
- **Retention-Schwäche:** Wo könnte die Aufmerksamkeit auf Audio-Ebene nachlassen?
- **Audio-Score:** [X/10]
- **Top-Empfehlung Audio:** [Konkrete Maßnahme]

---

## 📝 Text-Overlay & Caption-Audit

- **Lesbarkeit:** Schrift, Kontrast, Positionierung
- **Timing:** Erscheinen Texte zur richtigen Zeit?
- **Value-Add:** Ergänzen Texte den Content?
${req.captionText ? `- **Caption-Bewertung:** Klar, keyword-stark, mit gutem CTA?` : ''}

---

## 📣 CTA & Retention-Ende: X/10

- **CTA-Qualität:** Klarer Aufruf? Welcher Typ?
- **Loop-Faktor:** Endet das Video so, dass man es nochmal ansehen will?
- **Abschluss-Stärke:** Stark oder flau?

---

## 🔥 Viralitäts-Einschätzung: X/10

- **Algorithmus-Signale:** Was begünstigt / benachteiligt Reichweite?
- **Share-Worthiness:** Würde jemand das teilen?
- **Save-Trigger:** Gibt es einen Grund zum Speichern?
- **Kommentar-Anreiz:** Regt das Video zur Interaktion an?

---

## 🧠 Zielgruppen-Hypothese (KI-Einschätzung)

*Basierend auf Visuals, Thema, Stil und Account-Kontext — als KI-Hypothese markiert.*

- **Wahrscheinliche Kern-Zielgruppe:** [Beschreibung]
- **Alterscluster:** [z.B. 18–25, 25–35]
- **Interessencluster:** [3–5 Stichworte]
- **Konsummotiv:** [Warum schauen sie das?]
- **Platform-Fit:** [Passt das Video zu ${platformLabel}?]
- **Brand-Fit-Hinweise:** [Welche Branchen/Produkte könnten passen?]

---

## 🖼️ Bester Thumbnail-Frame

Welcher Frame (1–${req.frames.length}) eignet sich am besten als Cover und warum?

---

## 🔝 Top 5 Sofort-Maßnahmen

Priorisiert, sofort umsetzbar — vor dem Posten:

1. **[HÖCHSTE PRIORITÄT]** [Was tun] — [Warum größter Impact]
2. [Konkrete Maßnahme] — [Begründung]
3. [Konkrete Maßnahme] — [Begründung]
4. [Konkrete Maßnahme] — [Begründung]
5. [Konkrete Maßnahme] — [Begründung]

---

## ✍️ Optimierter Hook-Entwurf

Falls der Hook stärker sein könnte — beschreibe ein alternatives Opening für die ersten 1–3 Sekunden für ${platformLabel}. Was zeigen, was sagen, welcher Text?`
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
