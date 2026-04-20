import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code             = searchParams.get('code')
  const type             = searchParams.get('type')
  const next             = searchParams.get('next') ?? '/journal'
  const error            = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Supabase returned an OAuth error
  if (error) {
    const msg = errorDescription ?? error
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(msg)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()

    // ── Decide destination before building the response ───────────────────
    let destination = `${origin}${next}`
    if (type === 'signup' || type === 'email_change' || type === 'email') {
      destination = `${origin}/auth/confirmed`
    } else if (type === 'recovery') {
      destination = `${origin}/auth/reset-password`
    }

    // ── Build the redirect response first so we can attach cookies to it ──
    // This is critical: NextResponse.redirect() creates a brand-new response.
    // If we set cookies on cookieStore instead, they don't travel with this
    // redirect and the middleware sees no session → lands on the landing page.
    const response = NextResponse.redirect(destination)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            // Write cookies onto the redirect response directly
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return response
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`
    )
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent('Invalid or expired confirmation link.')}`
  )
}
