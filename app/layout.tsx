import type { Metadata } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KoveFX — The AI Trading Journal That Actually Helps You Improve',
  description:
    'KoveFX is the professional trading journal for serious traders. Track performance, identify patterns, eliminate mistakes, and trade with measurable discipline — powered by AI.',
  keywords: ['trading journal', 'forex journal', 'AI trading', 'trade analysis', 'KoveFX', 'DMFX'],
  authors: [{ name: 'DMFX' }],
  robots: 'index, follow',
  openGraph: {
    title: 'KoveFX — The AI Trading Journal That Actually Helps You Improve',
    description: 'Track performance, identify patterns, and eliminate mistakes. The professional trading journal built for serious traders.',
    type: 'website',
    url: 'https://kovefx.com',
    siteName: 'KoveFX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoveFX — The AI Trading Journal',
    description: 'The professional trading journal built for serious traders.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
