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
  title: 'KoveFX — Trading Journal & Performance System',
  description:
    'The trading journal built for serious traders. Track performance, identify patterns, and trade with measurable discipline.',
  openGraph: {
    title: 'KoveFX — Trading Journal & Performance System',
    description: 'The trading journal built for serious traders.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
