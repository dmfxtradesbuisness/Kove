'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router      = useRouter()
  const params      = useSearchParams()
  const didRun      = useRef(false)

  useEffect(() => {
    // Prevent double-run in React strict mode
    if (didRun.current) return
    didRun.current = true

    const supabase = createClient()
    const code     = params.get('code')
    const next     = params.get('next') ?? '/journal'
    const type     = params.get('type')
    const error    = params.get('error')
    const errorDesc = params.get('error_description')

    if (error) {
      router.replace(`/auth/error?error=${encodeURIComponent(errorDesc ?? error)}`)
      return
    }

    if (code) {
      // Exchange code for session client-side — the browser already has the
      // PKCE code verifier in its storage, so this is guaranteed to work.
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchErr }) => {
        if (exchErr) {
          router.replace(`/auth/error?error=${encodeURIComponent(exchErr.message)}`)
          return
        }
        if (type === 'recovery') {
          router.replace('/auth/reset-password')
        } else if (type === 'signup' || type === 'email_change' || type === 'email') {
          router.replace('/auth/confirmed')
        } else {
          router.replace(next)
        }
      })
      return
    }

    // Fallback: no code param — listen for an auth state change (implicit flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe()
        router.replace('/journal')
      }
    })

    // If nothing happens in 4 seconds, send to error
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      router.replace('/auth/error?error=No+auth+code+received')
    }, 4000)

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#030408',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.08)',
        borderTopColor: '#1E6EFF',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030408' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#1E6EFF', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
