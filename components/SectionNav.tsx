'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A sport page runs to six long sections. This is the strip that says where in
 * it you are — it sticks under the header, highlights the section in view, and
 * scrolls its own overflow on a phone rather than wrapping to three lines.
 */
export default function SectionNav({ items }: { items: { id: string; label: string }[] }) {
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
      <ul className="mx-auto flex max-w-[86rem] gap-x-1 overflow-x-auto px-5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
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
