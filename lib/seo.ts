import type { Metadata } from 'next'
import { asset } from './asset'

/**
 * Where this build will be served from, origin included.
 *
 * Social scrapers — WhatsApp, Slack, iMessage, X — do not resolve relative
 * URLs against the page they fetched. A card image written as `/og.png` is
 * simply dropped, which is why sharing a link produced no preview at all. So
 * every URL this module hands to a meta tag is absolute, built once here.
 */
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://andifathulms.github.io')
  .replace(/\/$/, '')

/** The site root, including the base path a project page is served under. */
export const SITE_URL = `${ORIGIN}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}`

export const SITE_NAME = 'Ruleset'

export const SITE_TAGLINE = 'How sports became the sports they are'

export const SITE_DESCRIPTION =
  'How sports became the sports they are. Rule changes with a cause, a date, a citation, and a measurable consequence.'

/** An absolute URL for a route. `/breaks/` in, `https://host/base/breaks/` out. */
export function url(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** An absolute URL for a file in /public. */
export function assetUrl(path: string): string {
  return `${ORIGIN}${asset(path)}`
}

export interface CardImage {
  url: string
  width: number
  height: number
  alt: string
}

/**
 * The Open Graph and Twitter tags for one page.
 *
 * Both vocabularies are emitted rather than one: WhatsApp and Slack read Open
 * Graph, X reads the twitter:* tags and falls back inconsistently, and a card
 * that renders in one place and not the other is the failure this is meant to
 * fix.
 */
export function card({
  title,
  description,
  path,
  image,
  type = 'website',
}: {
  title: string
  description: string
  path: string
  image: CardImage
  type?: 'website' | 'article'
}): Metadata {
  const canonical = url(path)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      // The card carries the full title; the page's own <title> is templated.
      title: `${title} — ${SITE_NAME}`,
      description,
      locale: 'en_GB',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [image.url],
    },
  }
}

/** The card a page inherits when it has nothing more specific to show. */
export const DEFAULT_CARD: CardImage = {
  url: assetUrl('/og/default.png'),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
}
