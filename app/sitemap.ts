import type { MetadataRoute } from 'next'

const APP_URL = 'https://kovefx.com'
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${APP_URL}/signup`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: NOW,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
