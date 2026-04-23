import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/journal'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(searchParams.get('error_description') ?? error)}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError) {
        // On Vercel, x-forwarded-host is the real public hostname
        const forwardedHost = request.headers.get('x-forwarded-host')
        const redirectBase  = forwardedHost
          ? `https://${forwardedHost}`
          : origin
        return NextResponse.redirect(`${redirectBase}${next}`)
      }

      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(msg)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('Missing auth code')}`)
}
