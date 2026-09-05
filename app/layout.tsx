import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import { ScrollProgress } from '@/components/Motion'

export const metadata: Metadata = {
  title: {
    default: 'Ruleset — how sports became the sports they are',
    template: '%s — Ruleset',
  },
  description:
    'How sports became the sports they are. Rule changes with a cause, a date, a citation, and a measurable consequence.',
}

export const viewport: Viewport = { themeColor: '#05161A' }

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
        />
      </head>
      <body className="min-h-screen bg-ink text-chalk">
        <ScrollProgress />

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
            <div aria-hidden className="mt-12 flex items-center gap-0">
              <span className="h-px flex-1 bg-chalk/20" />
              <span className="h-4 w-px bg-chalk/20" />
              <span className="h-px flex-1 translate-y-[-16px] bg-chalk/20" />
            </div>

            <p className="mt-10 text-[13px] text-unmarked">
              Nothing here is interpolated across a break.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
