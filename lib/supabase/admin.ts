import { createClient } from '@supabase/supabase-js'

// Service-role client for server-only operations (webhooks, admin tasks).
// Does NOT use cookies — never expose this on the client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
