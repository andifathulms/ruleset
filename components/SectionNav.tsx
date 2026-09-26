'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A sport page runs to a dozen long sections in three acts. This says where in
 * it you are, in the form that suits the width:
 *
 * - on a wide screen, a rail beside the text (SectionRail): the sections by
 *   act, the ones behind you ticked off, and how far through this one you are;
 * - on a tablet, a strip that sticks under the header (SectionNav);
 * - on a phone, a button at the foot of the screen that opens the list as a
 *   sheet (inside SectionNav), because a strip there is one more bar across a
 *   small screen.
 */
export interface NavItem {
  id: string
  label: string
  /** Section number as the page prints it. */
  n: number
  /** The act this section belongs to. */
  act: string
}

/** Which section is being read, and how far through it, from the scroll. */
function useReading(items: NavItem[]) {
  const [state, setState] = useState({ index: 0, progress: 0, past: false })

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const header =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56
      const line = header + window.innerHeight * 0.25
      let index = 0
      let progress = 0
      let past = false
      items.forEach((item, i) => {
        const el = document.getElementById(item.id)
        if (!el) return
        const box = el.getBoundingClientRect()
        if (box.top <= line) {
          index = i
          progress = Math.min(1, Math.max(0, (line - box.top) / Math.max(1, box.height)))
        }
        // Past the end of the last section: the page is on its pager and footer.
        if (i === items.length - 1) past = box.bottom < window.innerHeight * 0.6
      })
      setState((s) =>
        s.index === index && s.past === past && Math.abs(s.progress - progress) < 0.01
          ? s
          : { index, progress, past },
      )
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  return state
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The tablet strip and the phone sheet. Hidden on a wide screen, where the rail takes over. */
export default function SectionNav({ items, colour }: { items: NavItem[]; colour: string }) {
  const { index, progress, past } = useReading(items)
  const active = items[index]?.id
  const bar = useRef<HTMLElement>(null)

  // Anchors on this page have to clear the strip as well as the header. The
  // strip is display:none on a phone and a wide screen, which publishes 0.
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

  // The strip is wider than a tablet, so the section being read is scrolled
  // into it, or the last act is never seen.
  useEffect(() => {
    const el = bar.current?.querySelector(`a[href="#${active}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  return (
    <>
      <nav
        ref={bar}
        aria-label="Sections"
        style={{ top: 'var(--header-h, 56px)' }}
        className="sticky z-30 hidden border-b chalk-rule bg-ink/85 backdrop-blur-xl md:block xl:hidden"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-ink to-transparent"
        />
        <ul className="mx-auto flex max-w-[86rem] gap-x-1 overflow-x-auto px-5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => (
            <li key={item.id} className="flex shrink-0 items-center">
              {/* A group opens with a rule, not with its name: the act names
                  are stated at full size on the act headings in the page. */}
              {i > 0 && item.act !== items[i - 1].act && (
                <span aria-hidden className="mx-3 h-4 w-px shrink-0 bg-chalk/25" title={item.act} />
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

      <SectionSheet items={items} index={index} progress={progress} past={past} colour={colour} />
    </>
  )
}

/** The wide-screen rail. `children` sits under the list: the sport's break. */
export function SectionRail({
  items,
  colour,
  children,
}: {
  items: NavItem[]
  colour: string
  children?: React.ReactNode
}) {
  const { index, progress } = useReading(items)
  const acts = [...new Set(items.map((i) => i.act))]

  return (
    <div
      className="sticky space-y-5"
      style={{ top: 'calc(var(--header-h, 56px) + 1.5rem)' }}
    >
      <nav aria-label="On this page" className="border chalk-rule bg-surface px-4 pb-3 pt-4">
        <p className="flex items-baseline justify-between text-[13px] font-medium text-dim">
          On this page
          <span className="numeral text-[14px] font-normal text-unmarked">
            {items[index]?.n ?? 1} / {items.length}
          </span>
        </p>
        {acts.map((act) => (
          <div key={act}>
            <p className="mb-1 mt-3.5 text-[12.5px]" style={{ color: colour }}>
              {act}
            </p>
            <ol>
              {items.map((item, i) => {
                if (item.act !== act) return null
                const done = i < index
                const current = i === index
                return (
                  <li key={item.id} className="relative">
                    {current && (
                      <span
                        aria-hidden
                        className="absolute -left-4 bottom-1.5 top-1.5 w-[3px]"
                        style={{ background: colour }}
                      />
                    )}
                    <a
                      href={`#${item.id}`}
                      aria-current={current ? 'true' : undefined}
                      className={`grid grid-cols-[1.6rem_1fr] items-baseline py-[5px] text-[14px] leading-snug transition-colors hover:text-chalk ${
                        current ? 'font-medium text-chalk' : done ? 'text-chalk/55' : 'text-dim'
                      }`}
                    >
                      <span
                        className="numeral text-[13px]"
                        style={{ color: done || current ? colour : undefined }}
                      >
                        {pad(item.n)}
                      </span>
                      {item.label}
                    </a>
                    {current && (
                      <span aria-hidden className="mb-1 ml-[1.6rem] block h-[2px] bg-chalk/10">
                        <span
                          className="block h-full origin-left transition-transform duration-200"
                          style={{ background: colour, transform: `scaleX(${progress})` }}
                        />
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </nav>
      {children}
    </div>
  )
}

/** The phone form: a button with a progress ring, opening the list as a sheet. */
function SectionSheet({
  items,
  index,
  progress,
  past,
  colour,
}: {
  items: NavItem[]
  index: number
  progress: number
  /** Scrolled past the last section: the button steps aside for the footer. */
  past: boolean
  colour: string
}) {
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => {
    setOpen(false)
    button.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    sheet.current?.querySelector<HTMLElement>('[aria-current="true"], a')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Share of the page read, by section: whole sections behind, plus this one.
  const share = (index + progress) / Math.max(1, items.length)
  const R = 10
  const C = 2 * Math.PI * R
  const acts = [...new Set(items.map((i) => i.act))]

  return (
    <div className="md:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="section-sheet"
        onClick={() => setOpen(true)}
        tabIndex={past ? -1 : undefined}
        aria-hidden={past || undefined}
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 flex -translate-x-1/2 transition-[opacity,transform] duration-300 ${
          past ? 'pointer-events-none translate-y-6 opacity-0' : ''
        } items-center gap-2.5 whitespace-nowrap rounded-full bg-chalk py-2 pl-2 pr-4 text-[14px] font-semibold text-ink shadow-[0_12px_30px_rgb(0_0_0/0.55)]`}
      >
        <svg viewBox="0 0 26 26" className="h-[26px] w-[26px] -rotate-90" aria-hidden>
          <circle cx="13" cy="13" r={R} stroke="#04131722" strokeWidth="3" fill="none" />
          <circle
            cx="13" cy="13" r={R} fill="none" strokeWidth="3"
            stroke={colour}
            strokeDasharray={`${share * C} ${C}`}
          />
        </svg>
        Sections · {items[index]?.n ?? 1} of {items.length}
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sections">
          <button
            type="button"
            aria-label="Close sections"
            onClick={close}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />
          <div
            id="section-sheet"
            ref={sheet}
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto border-t chalk-rule bg-raised px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-3"
          >
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-chalk/25" />
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[26px] text-chalk">Sections</p>
              <button type="button" onClick={close} className="px-2 py-1 text-[14px] text-dim">
                Close
              </button>
            </div>
            {acts.map((act) => (
              <div key={act}>
                <p className="mb-1 mt-4 text-[13px]" style={{ color: colour }}>
                  {act}
                </p>
                <ol>
                  {items.map((item, i) =>
                    item.act !== act ? null : (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={() => setOpen(false)}
                          aria-current={i === index ? 'true' : undefined}
                          className={`grid grid-cols-[2rem_1fr] items-baseline border-b chalk-rule py-3 text-[16px] ${
                            i === index ? 'font-medium text-chalk' : i < index ? 'text-chalk/55' : 'text-dim'
                          }`}
                        >
                          <span className="numeral text-[14px]" style={{ color: i <= index ? colour : undefined }}>
                            {pad(item.n)}
                          </span>
                          {item.label}
                        </a>
                      </li>
                    ),
                  )}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
