import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Ruleset',
    template: '%s — Ruleset',
  },
  description: 'How sports became the sports they are. Rule changes with a cause, a date, a citation, and a measurable consequence.',
}

const nav = [
  { href: '/', label: 'Timeline' },
  { href: '/sports/', label: 'Sports' },
  { href: '/program/', label: 'Programme' },
  { href: '/breaks/', label: 'Breaks' },
  { href: '/sources/', label: 'Sources' },
  { href: '/about/', label: 'About' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&display=swap"
        />
      </head>
      <body className="min-h-screen bg-surface text-chalk">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-chalk focus:px-3 focus:py-2 focus:text-surface"
        >
          Skip to content
        </a>

        <header className="border-b chalk-rule">
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-6 gap-y-2 px-5 py-4">
            <Link href="/" className="font-display text-2xl tracking-wide text-chalk">
              Ruleset
            </Link>
            <p className="text-[13px] text-unmarked">
              How sports became the sports they are.
            </p>
            <nav aria-label="Primary" className="ml-auto flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-chalk/70 underline-offset-4 transition-colors hover:text-chalk hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-24 border-t chalk-rule">
          <div className="prose-measure mx-auto max-w-6xl px-5 py-10 text-[14px] text-unmarked">
            <p>
              Read-only, static, and deliberately incomplete. Coverage grows where
              the author&rsquo;s curiosity goes. Four sports are researched; the
              rest of the Olympic programme is present as status data only and is
              marked as such wherever it appears.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
