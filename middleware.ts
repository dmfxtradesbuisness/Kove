import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Always allow auth callback / confirmation / error routes
  const publicAuthRoutes = ['/auth/callback', '/auth/confirmed', '/auth/error', '/auth/reset-password']
  if (publicAuthRoutes.some((r) => pathname.startsWith(r))) {
    return supabaseResponse
  }

  const protectedRoutes = ['/onboarding', '/journal', '/ai', '/stats', '/account', '/goals', '/gallery', '/community', '/news', '/api/trades', '/api/journals', '/api/goals', '/api/checklist', '/api/gallery', '/api/preferences', '/api/leaderboard', '/api/ai', '/api/onboarding', '/api/stripe/subscription-status', '/api/stripe/checkout', '/api/stripe/portal', '/api/stripe/invoices', '/api/community']
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const journalUrl = request.nextUrl.clone()
    journalUrl.pathname = '/journal'
    return NextResponse.redirect(journalUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
