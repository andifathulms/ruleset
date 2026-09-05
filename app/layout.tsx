import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Sans } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import { HashLanding, ScrollProgress } from '@/components/Motion'

export const metadata: Metadata = {
  title: {
    default: 'Ruleset — how sports became the sports they are',
    template: '%s — Ruleset',
  },
  description:
    'How sports became the sports they are. Rule changes with a cause, a date, a citation, and a measurable consequence.',
}

export const viewport: Viewport = { themeColor: '#05161A' }

/*
  Self-hosted at build time rather than fetched from Google.
  Two reasons, one of them measured: the stylesheet plus font files were four
  external round-trips on a site that otherwise needs none, and when they
  landed at roughly 800ms the prose re-flowed and the page lost about 600px of
  height — which silently moved every anchor a deep link had already scrolled
  to. next/font also emits a fallback whose metrics are adjusted to match, so
  the swap no longer changes how much room the text takes.

  The wdth axis is not optional: the display face is set at 62% width
  throughout, which is the whole reason it reads as scoreboard type.
*/
const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
})

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

const FOOTER_NAV = [
  {
    heading: 'The board',
    links: [
      { href: '/', label: 'Cross-sport timeline' },
      { href: '/breaks/', label: 'Comparability breaks' },
      { href: '/program/', label: 'Olympic programme' },
    ],
  },
  {
    heading: 'The record',
    links: [
      { href: '/sports/', label: 'Sports' },
      { href: '/sources/', label: 'Sources and standing' },
      { href: '/about/', label: 'What this refuses to do' },
    ],
  },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ink text-chalk">
        <ScrollProgress />
        <HashLanding />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-chalk focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main">{children}</main>

        <footer className="mt-28 border-t chalk-rule">
          <div className="mx-auto max-w-[86rem] px-5 py-14">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
              <div>
                <p className="font-display text-3xl text-chalk">Ruleset</p>
                <p className="prose-measure mt-3 text-[15px] text-dim">
                  Read-only, static, and deliberately incomplete. Coverage grows
                  where the author&rsquo;s curiosity goes. The researched sports
                  carry a cause and a citation per rule change; the rest of the
                  Olympic programme is present as status data only, and is
                  marked as such wherever it appears.
                </p>
              </div>

              {FOOTER_NAV.map((col) => (
                <nav key={col.heading} aria-label={col.heading}>
                  <p className="eyebrow">{col.heading}</p>
                  <ul className="mt-4 space-y-2.5 text-[15px]">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="link-paint text-chalk/75 hover:text-chalk">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            {/* The site's argument, as a hairline: a line that steps. */}
            <svg
              aria-hidden
              viewBox="0 0 1000 20"
              preserveAspectRatio="none"
              className="mt-12 h-5 w-full"
            >
              <path
                d="M0,15 H482 M488,15 V5 M494,5 H1000"
                stroke="#F2F5F1"
                strokeOpacity="0.22"
                strokeWidth="1"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <p className="mt-10 text-[13px] text-unmarked">
              Nothing here is interpolated across a break.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
