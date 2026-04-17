// Separate module to avoid Next.js route export constraints
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptToken, encryptToken, renewToken } from '@/lib/tradovate'

export async function getValidTradovateToken(
  userId: string
): Promise<{ token: string; isDemo: boolean } | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('broker_connections')
    .select('access_token, token_expiry, is_demo')
    .eq('user_id', userId)
    .eq('broker', 'tradovate')
    .eq('connected', true)
    .single()

  if (!data?.access_token) return null

  const token  = decryptToken(data.access_token)
  const isDemo = data.is_demo ?? false

  // Renew if expiring within 10 minutes
  if (data.token_expiry) {
    const expiresAt = new Date(data.token_expiry).getTime()
    if (expiresAt - Date.now() < 10 * 60 * 1000) {
      try {
        const renewed = await renewToken(token, isDemo)
        if (renewed.accessToken) {
          await admin
            .from('broker_connections')
            .update({
              access_token: encryptToken(renewed.accessToken),
              token_expiry: renewed.expirationTime ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('broker', 'tradovate')
          return { token: renewed.accessToken, isDemo }
        }
      } catch { /* fall through */ }
    }
  }

  return { token, isDemo }
}
