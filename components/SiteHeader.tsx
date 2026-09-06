'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const NAV = [
  { href: '/', label: 'Timeline' },
  { href: '/sports/', label: 'Sports' },
  { href: '/play/', label: 'How to play' },
  { href: '/program/', label: 'Programme' },
  { href: '/breaks/', label: 'Breaks' },
  { href: '/sources/', label: 'Sources' },
  { href: '/about/', label: 'About' },
]

/**
 * The header is a scoreboard header: the wordmark, the strapline, and the
 * places to go. It condenses on scroll rather than disappearing, because the
 * timeline is long and losing the nav halfway down it was the main complaint
 * the layout invited.
 */
export default function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)

  const bar = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Everything that has to sit under this header — the section strip, and the
     scroll-margin on every anchor — used to hardcode its height. The header
     condenses on scroll and reflows with the font, so the number was wrong
     twice over: a 1.6px seam under the bar and links landing beneath it. */
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const publish = () =>
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, ''))

  return (
    <header
      ref={bar}
      className={`sticky top-0 z-40 border-b transition-all duration-500 ease-paint ${
        stuck
          ? 'border-chalk/[0.12] bg-ink/85 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div
        className={`mx-auto flex max-w-[86rem] items-center gap-x-6 px-5 transition-all duration-500 ease-paint ${
          stuck ? 'py-2.5' : 'py-4 sm:py-5'
        }`}
      >
        <Link href="/" className="group flex items-baseline gap-3">
          {/* The wordmark carries the site's one graphic idea at small size:
              a painted line that steps. */}
          <span
            aria-hidden
            className="hidden h-[14px] w-9 shrink-0 sm:block"
            style={{
              background:
                'linear-gradient(to bottom, transparent 5px, #F2F5F1 5px, #F2F5F1 7px, transparent 7px) 0 0 / 16px 100% no-repeat, linear-gradient(to bottom, transparent 9px, #F2F5F1 9px, #F2F5F1 11px, transparent 11px) 20px 0 / 16px 100% no-repeat',
            }}
          />
          <span
            className={`font-display tracking-wide text-chalk transition-all duration-500 ease-paint ${
              stuck ? 'text-xl' : 'text-2xl'
            }`}
          >
            Ruleset
          </span>
        </Link>

        <p
          className={`hidden text-[13px] text-unmarked transition-opacity duration-300 lg:block ${
            stuck ? 'opacity-0' : 'opacity-100'
          }`}
        >
          How sports became the sports they are.
        </p>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-x-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-1.5 text-[14px] transition-colors duration-300 ${
                  active ? 'text-chalk' : 'text-chalk/60 hover:text-chalk'
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-[2px] origin-left bg-chalk transition-transform duration-300 ease-paint ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto flex h-9 w-9 flex-col items-center justify-center gap-[5px] border border-chalk/20 md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span
            aria-hidden
            className={`block h-[2px] w-4 bg-chalk transition-transform duration-300 ${
              open ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            aria-hidden
            className={`block h-[2px] w-4 bg-chalk transition-opacity duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            aria-hidden
            className={`block h-[2px] w-4 bg-chalk transition-transform duration-300 ${
              open ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary, small screens"
        className={`overflow-hidden border-t border-chalk/10 bg-ink/95 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-paint md:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="px-5 py-2">
          {NAV.map((item) => (
            <li key={item.href} className="border-b border-chalk/[0.08] last:border-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`flex items-center justify-between py-3 font-display text-xl ${
                  isActive(item.href) ? 'text-chalk' : 'text-chalk/65'
                }`}
              >
                {item.label}
                {isActive(item.href) && <span aria-hidden className="h-[2px] w-6 bg-chalk" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
