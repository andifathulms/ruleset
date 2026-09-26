'use client'

import { useEffect, useRef, useState } from 'react'

export interface BreakKind {
  id: string
  label: string
  blurb: string
  /** Entries on the page carrying at least one break of this kind. */
  count: number
}

/**
 * The kinds of break, as the way into sixty-odd entries: pick a kind, or type
 * a sport or a series, and the page keeps only the entries that match.
 *
 * The entries themselves are rendered on the server — charts and all — and
 * carry `data-break-kinds` and `data-break-text`; this only shows and hides
 * them. With no script the page shows every entry, which is where it starts.
 */
export default function BreaksFilter({ kinds, total }: { kinds: BreakKind[]; total: number }) {
  const [kind, setKind] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(total)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = query.trim().toLowerCase()
    let n = 0
    document.querySelectorAll<HTMLElement>('[data-break-kinds]').forEach((el) => {
      const kindOk = !kind || (el.dataset.breakKinds ?? '').split(' ').includes(kind)
      const textOk = !q || (el.dataset.breakText ?? '').includes(q)
      el.hidden = !(kindOk && textOk)
      if (!el.hidden) n += 1
    })
    setShown(n)
    const empty = document.getElementById('breaks-empty')
    if (empty) empty.hidden = n > 0
  }, [kind, query])

  const pick = (id: string | null) => {
    setKind(id)
    // Bring the first matching entry into reach rather than leaving the
    // reader looking at the filter.
    requestAnimationFrame(() => {
      const top = bar.current?.getBoundingClientRect().top ?? 0
      if (top > window.innerHeight * 0.6) bar.current?.scrollIntoView({ block: 'start' })
    })
  }

  const active = kinds.find((k) => k.id === kind)

  return (
    <>
      <div role="group" aria-label="Filter by kind of break" className="grid gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-2 lg:grid-cols-5">
        {kinds.map((k) => {
          const on = kind === k.id
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(on ? null : k.id)}
              className={`group flex flex-col p-5 text-left transition-colors ${
                on ? 'bg-raised' : 'bg-ink hover:bg-surface'
              }`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="numeral text-fluid-h2 leading-none text-chalk">{k.count}</span>
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                    on ? 'border-chalk bg-chalk' : 'border-chalk/40 group-hover:border-chalk'
                  }`}
                />
              </span>
              <span className="mt-2 font-display text-[21px] leading-tight text-chalk">{k.label}</span>
              <span className="mt-1.5 text-[14px] leading-snug text-unmarked">{k.blurb}</span>
            </button>
          )
        })}
      </div>

      <div
        ref={bar}
        className="sticky z-20 -mx-5 mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y chalk-rule bg-ink/[0.88] px-5 py-3 backdrop-blur-xl"
        style={{ top: 'var(--header-h, 56px)' }}
      >
        <label className="flex h-10 min-w-0 flex-[1_1_16rem] items-center gap-2.5 border border-chalk/25 bg-chalk/[0.04] px-3 focus-within:border-chalk">
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 opacity-60" aria-hidden>
            <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M11 11l3.6 3.6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span className="sr-only">Search breaks</span>
          <input
            id="break-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="A sport, a series, a governing body"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-chalk outline-none placeholder:text-unmarked [&::-webkit-search-cancel-button]:invert"
          />
        </label>
        <p className="text-[14px] text-unmarked" aria-live="polite">
          {shown === total && !active ? (
            <>All <span className="numeral text-chalk">{total}</span> entries</>
          ) : (
            <>
              <span className="numeral text-chalk">{shown}</span> of {total}
              {active ? <> · {active.label.toLowerCase()}</> : null}
            </>
          )}
        </p>
        {(kind || query) && (
          <button
            type="button"
            onClick={() => {
              setKind(null)
              setQuery('')
            }}
            className="text-[14px] text-chalk underline decoration-chalk/40 underline-offset-4 hover:decoration-chalk"
          >
            Show all
          </button>
        )}
      </div>
    </>
  )
}
