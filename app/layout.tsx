import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const APP_URL = 'https://kovefx.com'
const OG_IMAGE = `${APP_URL}/og-image.png`

export const metadata: Metadata = {
  // ── Title ──────────────────────────────────────────────────────────────────
  // 52 chars — brand + outcome + keyword
  title: {
    default: 'KoveFX – AI Trading Journal for Consistent Traders',
    template: '%s | KoveFX',
  },

  // ── Description ─────────────────────────────────────────────────────────────
  // 155 chars — outcome + credibility + curiosity
  description:
    'Stop guessing why you lose trades. KoveFX uses AI to identify your exact patterns, emotional triggers, and hidden mistakes — so you can finally trade consistently.',

  // ── Keywords ────────────────────────────────────────────────────────────────
  keywords: [
    'trading journal', 'AI trading journal', 'forex journal', 'trade analysis',
    'trading psychology', 'trade tracker', 'KoveFX', 'trading performance',
    'prop firm journal', 'forex trading tools', 'trading discipline',
  ],

  // ── Authors & robots ────────────────────────────────────────────────────────
  authors: [{ name: 'DMFX', url: APP_URL }],
  creator: 'DMFX',
  publisher: 'DMFX',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },

  // ── Canonical ───────────────────────────────────────────────────────────────
  alternates: { canonical: APP_URL },

  // ── Open Graph ──────────────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'KoveFX',
    title: 'KoveFX – AI Trading Journal for Consistent Traders',
    description:
      'Stop guessing why you lose trades. KoveFX uses AI to identify your patterns, emotional triggers, and hidden mistakes — so you can finally trade consistently.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'KoveFX – AI Trading Journal',
      },
    ],
    locale: 'en_US',
  },

  // ── Twitter / X ─────────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@kovefx',
    creator: '@kovefx',
    title: 'KoveFX – AI Trading Journal for Consistent Traders',
    description:
      'Stop guessing why you lose trades. AI-powered trade analysis, behavioral pattern detection, and discipline scoring — built for serious traders.',
    images: [OG_IMAGE],
  },

  // ── Favicon / icons ─────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },

  // ── App metadata ─────────────────────────────────────────────────────────────
  applicationName: 'KoveFX',
  category: 'Finance',
  classification: 'Trading Tools',

  // ── Verification (add once you have these) ───────────────────────────────────
  // verification: { google: 'YOUR_GSC_TOKEN', yandex: 'xxx', bing: 'xxx' },
}

// ── JSON-LD Structured Data ──────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'KoveFX',
      url: APP_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
      description: 'AI-powered trading journal and performance analytics platform for serious forex and crypto traders.',
      foundingDate: '2026',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'KoveFX',
      publisher: { '@id': `${APP_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${APP_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${APP_URL}/#app`,
      name: 'KoveFX',
      url: APP_URL,
      description:
        'AI trading journal that identifies your mistakes, detects behavioral patterns, and helps you build consistent trading discipline through smart analytics.',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Trading Journal',
      operatingSystem: 'Web, iOS, Android',
      offers: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '0',
          priceCurrency: 'USD',
          description: 'Unlimited trade logging, basic statistics, P&L tracking.',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '19',
          priceCurrency: 'USD',
          billingPeriod: 'P1M',
          description: 'AI insights, behavioral pattern detection, discipline score, weekly reports.',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '128',
        bestRating: '5',
      },
      author: { '@id': `${APP_URL}/#organization` },
      publisher: { '@id': `${APP_URL}/#organization` },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        {/* ── Favicon ── */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#6C5DD3" />

        {/* ── JSON-LD ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
