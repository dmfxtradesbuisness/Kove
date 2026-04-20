/**
 * AI request guard — two layers of protection:
 *   1. Payload size limits  (prevents token-stuffing / excessive context)
 *   2. In-memory per-user rate limit (prevents scripted hammering)
 *
 * The in-memory store works well within a warm serverless instance.
 * For multi-instance deployments at scale, swap the store for Vercel KV / Redis.
 */

// ─── Size limits ──────────────────────────────────────────────────────────────

const MAX_LAST_MESSAGE_CHARS = 4_000   // one message the user just typed
const MAX_HISTORY_MESSAGES   = 40      // total messages in the conversation array
const MAX_HISTORY_CHARS      = 40_000  // total chars across the whole history

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Returns an error string if limits are exceeded, null if OK. */
export function checkChatPayload(messages: unknown): string | null {
  if (!Array.isArray(messages)) return 'messages must be an array'
  if (messages.length > MAX_HISTORY_MESSAGES) {
    return `Conversation history too long (max ${MAX_HISTORY_MESSAGES} messages).`
  }

  let totalChars = 0
  for (const m of messages) {
    if (!m || typeof m !== 'object') return 'Invalid message format.'
    const content = (m as Record<string, unknown>).content
    if (typeof content !== 'string') return 'Invalid message format.'
    totalChars += content.length
    if (totalChars > MAX_HISTORY_CHARS) {
      return `Request too large. Keep conversation history under ${MAX_HISTORY_CHARS.toLocaleString()} characters.`
    }
  }

  const last = messages[messages.length - 1] as ChatMessage | undefined
  if (last?.content && last.content.length > MAX_LAST_MESSAGE_CHARS) {
    return `Message too long (max ${MAX_LAST_MESSAGE_CHARS.toLocaleString()} characters).`
  }

  return null
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

interface Window {
  count: number
  windowStart: number
}

const store = new Map<string, Window>()

const WINDOW_MS  = 60_000  // 1 minute rolling window
const PRO_LIMIT  = 60      // requests per minute for pro users (very generous, 1/sec)
const FREE_LIMIT = 5       // requests per minute for free users

/** Prune entries older than 2 windows to prevent unbounded memory growth. */
function prune() {
  const cutoff = Date.now() - WINDOW_MS * 2
  for (const [key, w] of store) {
    if (w.windowStart < cutoff) store.delete(key)
  }
}

/**
 * Returns null if the request is allowed, or an error message if rate-limited.
 * @param userId   Supabase user ID
 * @param isPro    Whether the user has an active subscription
 * @param endpoint Short string to namespace limits per endpoint (e.g. 'chat')
 */
export function checkRateLimit(userId: string, isPro: boolean, endpoint = 'default'): string | null {
  if (store.size > 10_000) prune()

  const key   = `${endpoint}:${userId}`
  const now   = Date.now()
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now })
    return null
  }

  entry.count += 1
  if (entry.count > limit) {
    const resetIn = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000)
    return `Rate limit reached. You can send up to ${limit} requests per minute. Try again in ${resetIn}s.`
  }

  return null
}
