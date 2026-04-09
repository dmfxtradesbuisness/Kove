import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KoveFX — AI-Powered Trading Journal',
  description:
    'Log trades, track performance, and get AI-driven insights to improve your trading across forex, crypto, stocks, indices and commodities.',
  openGraph: {
    title: 'KoveFX — AI-Powered Trading Journal',
    description:
      'Log trades, track performance, and get AI-driven insights to improve your trading across forex, crypto, stocks, indices and commodities.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
