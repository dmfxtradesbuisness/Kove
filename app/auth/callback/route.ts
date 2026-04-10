import { createServerClient } from '@supabase/ssr'
import type { SetAllCookies } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/journal'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Supabase returned an error (e.g. expired link, already confirmed)
  if (error) {
    const msg = errorDescription ?? error
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(msg)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()

    const setAll: SetAllCookies = (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      } catch {
        // Ignored in server context
      }
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll,
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Email confirmation or email change — show success screen
      if (type === 'signup' || type === 'email_change' || type === 'email') {
        return NextResponse.redirect(`${origin}/auth/confirmed`)
      }
      // Password recovery — redirect to reset-password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      // Default — go to journal
      return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`
    )
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent('Invalid or expired confirmation link.')}`
  )
}
