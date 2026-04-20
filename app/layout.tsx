import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// ── Single font — Inter for everything ──────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const APP_URL = 'https://kovefx.com'

export const metadata: Metadata = {
  title: {
    default: 'Kove – The Trade Journal That Actually Helps You Improve',
    template: '%s | Kove',
  },
  description:
    'Kove is the trade journal built to make you better. Log trades, find the patterns costing you money, and get clear feedback on exactly what to fix — so you stop repeating the same mistakes.',
  keywords: [
    'trading journal', 'free trading journal', 'trade journal app',
    'forex trading journal', 'trade tracker', 'trading performance analysis',
    'trading psychology', 'prop firm journal', 'funded account journal',
    'trading discipline', 'KoveFX', 'trade log', 'forex journal',
    'trading improvement', 'trading mistakes', 'trading consistency',
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
    type: 'website', url: APP_URL, siteName: 'Kove',
    title: 'Kove – The Trade Journal That Actually Helps You Improve',
    description: 'Log trades. Find the patterns costing you money. Get clear feedback on what to fix. Kove is the journal built to make you a better trader.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image', site: '@kovefx', creator: '@kovefx',
    title: 'Kove – The Trade Journal That Actually Helps You Improve',
    description: 'Log trades. Find the patterns costing you money. Get clear feedback on what to fix — built for traders who want to actually get better.',
  },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], shortcut: '/favicon.svg' },
  applicationName: 'KoveFX',
  category: 'Finance',
  classification: 'Trading Tools',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${APP_URL}/#organization`, name: 'KoveFX', url: APP_URL, description: 'The trade journal that actually helps you improve.', foundingDate: '2024' },
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
    <html lang="en" className={`dark ${inter.variable}`}>
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
