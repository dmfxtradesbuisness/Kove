import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans, Space_Mono } from 'next/font/google'
import './globals.css'

// ── Display font — headings, labels, UI chrome ──────────────────────────────
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

// ── Body font — prose, descriptions, notes ──────────────────────────────────
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

// ── Mono font — numbers, prices, P&L, data ──────────────────────────────────
const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap',
})

const APP_URL = 'https://kovefx.com'

export const metadata: Metadata = {
  title: {
    default: 'KoveFX – Free AI Trading Journal | Track, Analyze & Improve',
    template: '%s | KoveFX',
  },
  description:
    'KoveFX is a free AI-powered trading journal. Log unlimited trades, track your P&L, win rate, and let AI identify your exact behavioral patterns and mistakes — so you can finally trade consistently.',
  keywords: [
    'free trading journal', 'AI trading journal', 'trading journal app',
    'forex trading journal', 'trade tracker', 'trading performance analysis',
    'trading psychology app', 'prop firm journal', 'funded account journal',
    'trading discipline score', 'KoveFX', 'trade log', 'forex journal free',
    'trading journal online',
  ],
  authors: [{ name: 'KoveFX', url: APP_URL }],
  creator: 'KoveFX',
  publisher: 'KoveFX',
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  alternates: { canonical: APP_URL },
  openGraph: {
    type: 'website', url: APP_URL, siteName: 'KoveFX',
    title: 'KoveFX – Free AI Trading Journal | Track, Analyze & Improve',
    description: 'Log unlimited trades for free. KoveFX AI identifies your behavioral patterns, emotional triggers, and hidden mistakes so you can build consistent trading discipline.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image', site: '@kovefx', creator: '@kovefx',
    title: 'KoveFX – Free AI Trading Journal',
    description: 'Log trades free. AI-powered behavioral analysis, discipline scoring, and pattern detection — built for serious traders.',
  },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], shortcut: '/favicon.svg' },
  applicationName: 'KoveFX',
  category: 'Finance',
  classification: 'Trading Tools',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${APP_URL}/#organization`, name: 'KoveFX', url: APP_URL, description: 'Free AI-powered trading journal.', foundingDate: '2024' },
    { '@type': 'WebSite', '@id': `${APP_URL}/#website`, url: APP_URL, name: 'KoveFX', publisher: { '@id': `${APP_URL}/#organization` } },
    {
      '@type': 'SoftwareApplication', '@id': `${APP_URL}/#app`, name: 'KoveFX Trading Journal',
      url: APP_URL, applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser',
      offers: [
        { '@type': 'Offer', name: 'Starter', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Pro', price: '19', priceCurrency: 'USD' },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${dmSans.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#1E6EFF" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
