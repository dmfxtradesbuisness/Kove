import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/journal',
          '/stats',
          '/goals',
          '/gallery',
          '/ai',
          '/community',
          '/news',
          '/account',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://kovefx.com/sitemap.xml',
    host: 'https://kovefx.com',
  }
}
