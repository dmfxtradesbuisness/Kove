import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticate, getAccounts, encryptToken } from '@/lib/tradovate'
import { NextRequest, NextResponse } from 'next/server'

// GET — return current Tradovate connection status
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('broker_connections')
    .select('connected, account_name, is_demo, last_sync, token_expiry')
    .eq('user_id', user.id)
    .eq('broker', 'tradovate')
    .single()

  if (!data || !data.connected) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected: true,
    account_name: data.account_name,
    is_demo: data.is_demo,
    last_sync: data.last_sync,
    token_expiry: data.token_expiry,
  })
}

// POST — connect Tradovate account
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, password, is_demo = false } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
  }

  // Check env vars configured
  if (!process.env.TRADOVATE_CLIENT_ID || !process.env.TRADOVATE_CLIENT_SECRET) {
    return NextResponse.json({
      error: 'Tradovate API credentials not configured. Add TRADOVATE_APP_ID, TRADOVATE_CLIENT_ID, and TRADOVATE_CLIENT_SECRET to your environment variables.',
    }, { status: 503 })
  }

  // Authenticate with Tradovate
  let auth
  try {
    auth = await authenticate(username, password, is_demo)
  } catch (err) {
    return NextResponse.json({ error: `Could not reach Tradovate: ${err}` }, { status: 502 })
  }

  if (auth.errorText === 'TRADOVATE_NOT_CONFIGURED') {
    return NextResponse.json({ error: 'Tradovate not configured on this server.' }, { status: 503 })
  }

  if (auth.p2) {
    return NextResponse.json({
      error: 'This Tradovate account has two-factor authentication enabled. Please disable 2FA in your Tradovate account settings, then reconnect.',
    }, { status: 422 })
  }

  if (!auth.accessToken) {
    return NextResponse.json({
      error: auth.errorText ?? 'Invalid username or password.',
    }, { status: 401 })
  }

  // Get account info
  let accountName = auth.name ?? username
  try {
    const accounts = await getAccounts(auth.accessToken, is_demo)
    if (accounts.length > 0) accountName = accounts[0].name
  } catch { /* use fallback name */ }

  // Encrypt and store token
  const encryptedToken = encryptToken(auth.accessToken)

  const admin = createAdminClient()
  const { error } = await admin
    .from('broker_connections')
    .upsert({
      user_id: user.id,
      broker: 'tradovate',
      access_token: encryptedToken,
      token_expiry: auth.expirationTime ?? null,
      account_id: auth.userId ?? null,
      account_name: accountName,
      is_demo,
      connected: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,broker' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ connected: true, account_name: accountName, is_demo })
}

// DELETE — disconnect Tradovate
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  await admin
    .from('broker_connections')
    .update({ connected: false, access_token: null })
    .eq('user_id', user.id)
    .eq('broker', 'tradovate')

  return NextResponse.json({ disconnected: true })
}

