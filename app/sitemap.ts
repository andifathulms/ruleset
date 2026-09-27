import type { MetadataRoute } from 'next'
import { getSportIds } from '@/lib/content'
import { url } from '@/lib/seo'

/**
 * Every page on the site, listed for crawlers.
 *
 * The sport pages are generated from the same ids that build them, so a new
 * sport folder appears here without anybody remembering to add it. `priority`
 * is left off deliberately: it is advisory at best, and inventing a ranking
 * between these pages would be a claim the site cannot support.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/sports/', '/breaks/', '/play/', '/program/', '/sources/', '/about/']

  return [
    ...pages.map((path) => ({ url: url(path), changeFrequency: 'monthly' as const })),
    ...getSportIds().map((id) => ({
      url: url(`/sports/${id}/`),
      changeFrequency: 'monthly' as const,
    })),
  ]
}
