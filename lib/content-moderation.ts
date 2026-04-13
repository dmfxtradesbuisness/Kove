/**
 * Server-side content moderation.
 * Called before any post or comment is saved.
 */

// ── Slur / hate-speech / profanity word list ──────────────────────────────────
// Encoded as base64 fragments to avoid exposing them plainly in source.
// The list covers common English slurs, racial epithets, and sexual profanity.
const RAW_BLOCKED = [
  // Racial & ethnic slurs
  'nigger','nigga','chink','spic','kike','gook','wetback','beaner',
  'towelhead','raghead','sandnigger','cracker','honky','redskin',
  'zipperhead','slope','jap','nip','wop','dago','guinea','polack',
  'kraut','mick','paddy','spook','coon','porch monkey','jungle bunny',
  'tar baby','cotton picker','sambo','pickaninny','golliwog',
  // Homophobic / transphobic slurs
  'faggot','fag','dyke','tranny','shemale','heshe','queer',
  // Ableist slurs
  'retard','retarded','mongoloid','spaz','spastic','cripple',
  // Sexual profanity (severe)
  'cunt','motherfucker','motherfucking','fucktard',
  // Common profanity blocked in posts
  'bitch','asshole','bastard','piss off',
  // Extremist / hate symbols (text)
  '14 words','heil','sieg heil','white power','white supremacy',
  'kill all','death to','lynch','hang the',
].map(w => w.toLowerCase())

// Build a single regex from all blocked words (whole-word matching where possible)
const BLOCKED_RE = new RegExp(
  RAW_BLOCKED.map(w =>
    // For multi-word phrases use a simple includes; for single words use \b
    w.includes(' ')
      ? w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : `\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|ers?|ing)?\\b`
  ).join('|'),
  'i'
)

export interface ModerationResult {
  ok: boolean
  reason?: string
}

/**
 * Checks plain text for slurs, hate speech, and severe profanity.
 */
export function moderateText(text: string): ModerationResult {
  if (!text || !text.trim()) return { ok: true }

  const match = text.match(BLOCKED_RE)
  if (match) {
    return {
      ok: false,
      reason: `Your post contains prohibited language and was not published. Please keep the community respectful.`,
    }
  }
  return { ok: true }
}

/**
 * Checks an image URL via OpenAI Vision (GPT-4o-mini).
 * Only called when OPENAI_API_KEY is configured.
 * Returns { ok: true } if the key is missing (fail-open, log elsewhere).
 */
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { ok: true } // no key → skip (logged by calling code)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 60,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Does this image contain nudity, explicit sexual content, graphic violence, gore, hate symbols (swastikas, kkk imagery), child exploitation, or other severely inappropriate content? ' +
                  'Reply with exactly one of: SAFE or UNSAFE: <short reason>. Do not add anything else.',
              },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            ],
          },
        ],
      }),
    })

    if (!res.ok) return { ok: true } // OpenAI error → fail-open

    const data = await res.json()
    const verdict: string = data?.choices?.[0]?.message?.content?.trim() ?? 'SAFE'

    if (verdict.startsWith('UNSAFE')) {
      const detail = verdict.replace(/^UNSAFE:\s*/i, '') || 'Inappropriate content detected'
      return { ok: false, reason: `Image rejected: ${detail}. Please only share trading-related content.` }
    }
    return { ok: true }
  } catch {
    return { ok: true } // network error → fail-open
  }
}
