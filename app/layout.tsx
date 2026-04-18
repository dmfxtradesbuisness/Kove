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

export const metadata: Metadata = {
  // ── Title ──────────────────────────────────────────────────────────────────
  title: {
    default: 'KoveFX – Free AI Trading Journal | Track, Analyze & Improve',
    template: '%s | KoveFX',
  },

  // ── Description ─────────────────────────────────────────────────────────────
  description:
    'KoveFX is a free AI-powered trading journal. Log unlimited trades, track your P&L, win rate, and let AI identify your exact behavioral patterns and mistakes — so you can finally trade consistently.',

  // ── Keywords ────────────────────────────────────────────────────────────────
  keywords: [
    'free trading journal',
    'AI trading journal',
    'trading journal app',
    'forex trading journal',
    'trade tracker',
    'trading performance analysis',
    'trading psychology app',
    'prop firm journal',
    'funded account journal',
    'trading discipline score',
    'KoveFX',
    'trade log',
    'forex journal free',
    'trading journal online',
  ],

  // ── Authors & robots ────────────────────────────────────────────────────────
  authors: [{ name: 'KoveFX', url: APP_URL }],
  creator: 'KoveFX',
  publisher: 'KoveFX',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // ── Canonical ───────────────────────────────────────────────────────────────
  alternates: { canonical: APP_URL },

  // ── Open Graph ──────────────────────────────────────────────────────────────
  // Next.js serves the dynamic OG image from app/opengraph-image.tsx automatically
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'KoveFX',
    title: 'KoveFX – Free AI Trading Journal | Track, Analyze & Improve',
    description:
      'Log unlimited trades for free. KoveFX AI identifies your behavioral patterns, emotional triggers, and hidden mistakes so you can build consistent trading discipline.',
    locale: 'en_US',
  },

  // ── Twitter / X ─────────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@kovefx',
    creator: '@kovefx',
    title: 'KoveFX – Free AI Trading Journal',
    description:
      'Log trades free. AI-powered behavioral analysis, discipline scoring, and pattern detection — built for serious forex and crypto traders.',
  },

  // ── Icons ────────────────────────────────────────────────────────────────────
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },

  // ── App metadata ─────────────────────────────────────────────────────────────
  applicationName: 'KoveFX',
  category: 'Finance',
  classification: 'Trading Tools',
}

// ── JSON-LD Structured Data ──────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'KoveFX',
      url: APP_URL,
      description: 'Free AI-powered trading journal and performance analytics for forex, crypto, and prop firm traders.',
      foundingDate: '2024',
    },

    // WebSite — enables sitelinks search box
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'KoveFX',
      description: 'Free AI trading journal — log trades, track performance, and fix bad habits.',
      publisher: { '@id': `${APP_URL}/#organization` },
    },

    // WebPage — homepage
    {
      '@type': 'WebPage',
      '@id': `${APP_URL}/#webpage`,
      url: APP_URL,
      name: 'KoveFX – Free AI Trading Journal | Track, Analyze & Improve',
      description:
        'KoveFX is a free AI-powered trading journal. Log unlimited trades, track your P&L, win rate, and let AI identify your exact behavioral patterns and mistakes.',
      isPartOf: { '@id': `${APP_URL}/#website` },
      about: { '@id': `${APP_URL}/#organization` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL }],
      },
    },

    // SoftwareApplication
    {
      '@type': 'SoftwareApplication',
      '@id': `${APP_URL}/#app`,
      name: 'KoveFX Trading Journal',
      url: APP_URL,
      description:
        'Free AI trading journal that identifies your mistakes, detects behavioral patterns, and helps you build consistent trading discipline.',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Trading Journal',
      operatingSystem: 'Web Browser',
      offers: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Unlimited trade logging, full trade history, basic statistics — free forever.',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '19',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'AI behavioral insights, pattern detection, discipline score, weekly reports.',
        },
      ],
      author: { '@id': `${APP_URL}/#organization` },
    },

    // FAQPage — creates expandable FAQ sitelinks in Google results
    {
      '@type': 'FAQPage',
      '@id': `${APP_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is KoveFX free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. KoveFX Starter is completely free forever with no credit card required. You get unlimited trade logging, full trade history, and basic statistics at no cost.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a trading journal?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A trading journal is a record of all your trades including entry, exit, stop loss, take profit, P&L, and notes. KoveFX goes further by using AI to analyze your trading behavior and identify patterns causing losses.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the AI trading journal work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'KoveFX Pro uses AI to read your complete trade history and identify behavioral patterns — such as revenge trading, time-of-day performance leaks, and emotional triggers — then gives you a personalized improvement plan.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use KoveFX for a funded trading account?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. KoveFX works for live accounts, funded prop firm accounts, and backtesting. You can create separate journal profiles for each so your data stays organized.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the Discipline Score in KoveFX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Discipline Score (0–100) rates your trading behavior across stop loss usage, win rate consistency, overtrading frequency, and revenge trading patterns. It updates automatically as you log trades.',
          },
        },
        {
          '@type': 'Question',
          name: 'What markets does KoveFX support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'KoveFX supports all markets including forex (EUR/USD, GBP/USD, etc.), indices (NAS100, SPX500), commodities (XAU/USD, oil), and cryptocurrencies (BTC/USD, ETH/USD).',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#1E6EFF" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
