'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A sport page runs to six long sections. This is the strip that says where in
 * it you are — it sticks under the header, highlights the section in view, and
 * scrolls its own overflow on a phone rather than wrapping to three lines.
 */
export interface NavItem {
  id: string
  label: string
  /** First item of an act carries its name, so the strip shows the grouping. */
  act?: string
}

export default function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const bar = useRef<HTMLElement>(null)

  // Anchors on this page have to clear this strip as well as the header.
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const publish = () =>
      document.documentElement.style.setProperty('--subnav-h', `${el.offsetHeight}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--subnav-h')
    }
  }, [])

  // The strip is wider than a laptop viewport once the acts are in it, so the
  // section you are reading has to be scrolled into the strip, or the last act
  // is never seen.
  useEffect(() => {
    const el = bar.current?.querySelector(`a[href="#${active}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!targets.length || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [items])

  return (
    /* Flush to the header rather than 57px below the top: the header
       condenses on scroll, and the hardcoded offset left a moving sliver of
       page showing between the two bars. */
    <nav
      ref={bar}
      aria-label="Sections"
      style={{ top: 'var(--header-h, 56px)' }}
      className="sticky z-30 border-b chalk-rule bg-ink/85 backdrop-blur-xl"
    >
      {/* Says the strip continues, rather than letting the last act look absent. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-ink to-transparent"
      />
      <ul className="mx-auto flex max-w-[86rem] gap-x-1 overflow-x-auto px-5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <li key={item.id} className="flex shrink-0 items-center">
            {/*
              A group opens with a rule, not with its name. Spelling the three
              act names out here cost a third of the strip's width and pushed
              the last act off the end of a laptop screen, and set in the same
              row as the links they read as links. The names are already stated
              at full size on the act headings in the page; the strip only has
              to show where one group ends and the next begins.
            */}
            {item.act && i > 0 && (
              <span
                aria-hidden
                className="mx-3 h-4 w-px shrink-0 bg-chalk/25"
                title={item.act}
              />
            )}
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className={`relative block whitespace-nowrap px-3 py-2 text-[14px] transition-colors ${
                active === item.id ? 'text-chalk' : 'text-chalk/55 hover:text-chalk'
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={`absolute inset-x-3 bottom-0 h-[2px] origin-left bg-chalk transition-transform duration-300 ease-paint ${
                  active === item.id ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
