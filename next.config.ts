import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  // Block clickjacking
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  // Referrer info sent only on same-origin navigations
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 2 years
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Legacy XSS filter
  { key: 'X-XSS-Protection',        value: '1; mode=block' },
  // Restrict browser features
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      // Next.js requires unsafe-inline/eval for hydration; Stripe for payments
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com`,
      // Tailwind inline styles + Google Fonts
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      // Images from self, Supabase, data URIs, blob
      `img-src 'self' data: blob: https://*.supabase.co`,
      // API calls: Supabase (REST + realtime), Stripe, OpenAI
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.openai.com https://accounts.google.com`,
      // Stripe iframes for checkout
      `frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://accounts.google.com`,
      `media-src 'self'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self' https://accounts.google.com https://*.supabase.co`,
      `upgrade-insecure-requests`,
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
