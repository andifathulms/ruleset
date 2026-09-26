'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import MiniLane, { laneTickLeft } from './MiniLane'
import SportCover, { monogram, type CoverImage } from './SportCover'
import SportIcon, { hasSportIcon } from './SportIcon'

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

export interface SportCard {
  id: string
  label: string
  tagline: string
  governingBody: string
  colour: string
  years: number[]
  /** One entry per break year: a rule that severed two series is one break. */
  breaks: number[]
  series: number
  /** Lens id to the label of the group this sport sits in under that lens. */
  groups: Record<string, string>
  cover: CoverImage | null
}

export interface BrowserLens {
  id: string
  label: string
  groups: { label: string; colour: string }[]
}

type Sort = 'az' | 'rules' | 'breaks' | 'latest'
type View = 'auto' | 'grid' | 'list'

const SORTS: { id: Sort; label: string }[] = [
  { id: 'az', label: 'A to Z' },
  { id: 'rules', label: 'Most rule changes' },
  { id: 'breaks', label: 'Most breaks' },
  { id: 'latest', label: 'Latest change' },
]

const TICKS = [1900, 1950, 2000]
const NONE = 'none'

/**
 * The researched sports as something to browse rather than scroll: search,
 * grouped under the same lenses the timeline uses, sortable, as cards or as a
 * list. Everything runs on data already in the page — the site stays static.
 *
 * Before any script runs the page shows every sport, grouped under the default
 * lens, as cards on a wide screen and as a list on a phone.
 */
export default function SportsBrowser({
  sports,
  lenses,
  span,
  defaultLens,
}: {
  sports: SportCard[]
  lenses: BrowserLens[]
  span: [number, number]
  defaultLens: string
}) {
  const [query, setQuery] = useState('')
  const [lens, setLens] = useState(defaultLens)
  const [only, setOnly] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>('az')
  const [view, setView] = useState<View>('auto')
  const search = useRef<HTMLInputElement>(null)

  /* Resolve "auto" once the width is known, so the view buttons can say which
     view is showing. Server HTML already shows the right one for the width. */
  useEffect(() => {
    setView(window.matchMedia('(max-width: 639px)').matches ? 'list' : 'grid')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      if (e.key === '/' && !['input', 'select', 'textarea'].includes(tag)) {
        e.preventDefault()
        search.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeLens = lenses.find((l) => l.id === lens)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sports.filter(
      (s) => !q || `${s.label} ${s.tagline} ${s.governingBody}`.toLowerCase().includes(q),
    )
  }, [sports, query])

  const shown = useMemo(() => {
    const byName = (a: SportCard, b: SportCard) => a.label.localeCompare(b.label)
    const order: Record<Sort, (a: SportCard, b: SportCard) => number> = {
      az: byName,
      rules: (a, b) => b.years.length - a.years.length || byName(a, b),
      breaks: (a, b) => b.breaks.length - a.breaks.length || byName(a, b),
      latest: (a, b) => Math.max(...b.years) - Math.max(...a.years) || byName(a, b),
    }
    return matches
      .filter((s) => !activeLens || only.length === 0 || only.includes(s.groups[lens]))
      .sort(order[sort])
  }, [matches, activeLens, only, lens, sort])

  const sections = activeLens
    ? activeLens.groups
        .map((g) => ({ ...g, items: shown.filter((s) => s.groups[lens] === g.label) }))
        .filter((g) => g.items.length > 0)
    : [{ label: '', colour: 'unmarked', items: shown }]

  /* FLIP: when the lens, filter or order changes, each card that survives
     slides from where it was to where it now is — the regrouping is the
     information, as it is on the timeline. Reduced motion: it simply lands. */
  const root = useRef<HTMLDivElement>(null)
  const before = useRef<Map<string, DOMRect>>(new Map())
  const capture = () => {
    const map = new Map<string, DOMRect>()
    root.current?.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => {
      if (el.offsetParent) map.set(el.dataset.flip!, el.getBoundingClientRect())
    })
    before.current = map
  }
  useLayoutEffect(() => {
    const prev = before.current
    before.current = new Map()
    if (!prev.size || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    root.current?.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => {
      if (!el.offsetParent) return
      const was = prev.get(el.dataset.flip!)
      const now = el.getBoundingClientRect()
      if (now.bottom < -200 || now.top > window.innerHeight + 200) return
      if (was) {
        const dx = was.left - now.left
        const dy = was.top - now.top
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
          { duration: 450, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
        )
      } else {
        el.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
          { duration: 400, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
        )
      }
    })
  }, [lens, only, sort, query, view])

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    capture()
    set(v)
  }

  const toggleGroup = (label: string) =>
    change(setOnly)(only.includes(label) ? only.filter((g) => g !== label) : [...only, label])

  const total = sports.length
  const summary =
    shown.length === total
      ? `Showing all ${total} researched sports`
      : `Showing ${shown.length} of ${total} researched sports`

  const block = (items: SportCard[]) => {
    const grid = (
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((s) => (
          <Card key={s.id} sport={s} span={span} />
        ))}
      </ul>
    )
    const list = (
      <ul className="border-t chalk-rule">
        {items.map((s) => (
          <Row key={s.id} sport={s} span={span} />
        ))}
      </ul>
    )
    if (view === 'grid') return grid
    if (view === 'list') return list
    return (
      <>
        <div className="hidden sm:block">{grid}</div>
        <div className="sm:hidden">{list}</div>
      </>
    )
  }

  return (
    <div ref={root}>
      {/* The controls stay in reach all the way down a long list. Not on a
          phone, where two rows of controls would take a third of the screen. */}
      <div
        className="relative z-20 sm:sticky -mx-5 mt-10 border-y chalk-rule bg-ink/[0.88] px-5 py-3.5 backdrop-blur-xl"
        style={{ top: 'var(--header-h, 56px)' }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-11 min-w-0 flex-[1_1_16rem] items-center gap-2.5 border border-chalk/25 bg-chalk/[0.04] px-3 transition-colors focus-within:border-chalk">
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 opacity-60" aria-hidden>
              <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="M11 11l3.6 3.6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="sr-only">Search sports</span>
            <input
              ref={search}
              id="sport-search"
              type="search"
              value={query}
              onChange={(e) => change(setQuery)(e.target.value)}
              placeholder="Search a sport, a governing body, a phrase"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-chalk outline-none placeholder:text-unmarked [&::-webkit-search-cancel-button]:invert"
            />
            <kbd className="hidden rounded border border-chalk/25 px-1.5 text-[12px] text-unmarked sm:block">/</kbd>
          </label>

          <Segmented
            label="Group by"
            value={lens}
            onChange={(v) => {
              capture()
              setLens(v)
              setOnly([])
            }}
            options={[...lenses.map((l) => ({ id: l.id, label: l.label })), { id: NONE, label: 'A to Z' }]}
          />

          <label className="flex-[1_1_auto] sm:flex-none">
            <span className="sr-only">Sort</span>
            <select
              id="sport-sort"
              value={sort}
              onChange={(e) => change(setSort)(e.target.value as Sort)}
              className="h-11 w-full border border-chalk/25 bg-ink px-3 text-[14px] text-chalk"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <Segmented
            label="View"
            value={view}
            onChange={(v) => change(setView)(v as View)}
            options={[
              { id: 'grid', label: 'Cards' },
              { id: 'list', label: 'List' },
            ]}
          />
        </div>

        {activeLens && (
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Chip pressed={only.length === 0} onClick={() => change(setOnly)([])}>
              All <span className="numeral text-[15px] text-unmarked">{matches.length}</span>
            </Chip>
            {activeLens.groups.map((g) => {
              const n = matches.filter((s) => s.groups[lens] === g.label).length
              if (n === 0 && !only.includes(g.label)) return null
              return (
                <Chip key={g.label} pressed={only.includes(g.label)} onClick={() => toggleGroup(g.label)}>
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{ background: (COLOUR[g.colour] ?? COLOUR.unmarked).bright }}
                  />
                  {g.label} <span className="numeral text-[15px] text-unmarked">{n}</span>
                </Chip>
              )
            })}
          </div>
        )}
      </div>

      <p className="mt-6 text-[14px] text-unmarked" aria-live="polite">
        {summary}
      </p>

      {shown.length === 0 ? (
        <p className="prose-measure mt-8 text-fluid-base text-dim">
          No researched sport matches &ldquo;{query}&rdquo;. It may be listed under
          &ldquo;Not yet covered&rdquo; below, or go by another name.
        </p>
      ) : (
        sections.map((g) => (
          <section key={g.label || 'all'} className="mt-10">
            {g.label && (
              <h3 className="mb-5 flex items-baseline gap-3.5">
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 self-center rounded-[3px]"
                  style={{ background: (COLOUR[g.colour] ?? COLOUR.unmarked).bright }}
                />
                <span className="font-display text-fluid-h3 text-chalk">{g.label}</span>
                <span className="numeral text-[18px] text-unmarked">{g.items.length}</span>
                <span aria-hidden className="h-px flex-1 self-center bg-chalk/[0.12]" />
              </h3>
            )}
            {block(g.items)}
          </section>
        ))
      )}
    </div>
  )
}

function Card({ sport: s, span }: { sport: SportCard; span: [number, number] }) {
  const c = COLOUR[s.colour] ?? COLOUR.unmarked
  return (
    <li data-flip={s.id} className="flex">
      <Link
        href={`/sports/${s.id}/`}
        className="group relative flex w-full flex-col overflow-hidden border border-chalk/[0.12] bg-surface transition-[transform,border-color,box-shadow] duration-500 ease-paint hover:-translate-y-1 hover:border-[var(--bright)] hover:shadow-[0_24px_50px_-24px_var(--base)] focus-visible:border-[var(--bright)] motion-reduce:hover:translate-y-0"
        style={{ ['--base' as string]: c.base, ['--bright' as string]: c.bright }}
      >
        <div className="relative">
          <SportCover image={s.cover} colour={s.colour} label={s.label} className="aspect-[16/10]" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface to-transparent"
          />
          <span className="absolute -bottom-px left-4 h-12 w-12 bg-surface shadow-[0_0_0_4px_theme(colors.surface)]">
            <Pictogram sport={s} className="h-12 w-12" />
          </span>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-3.5 pt-3">
          <h4 className="mt-1 font-display text-[28px] leading-none text-chalk">{s.label}</h4>
          <p className="mt-2 line-clamp-3 text-[14.5px] leading-snug text-chalk/75">{s.tagline}</p>
          <span aria-hidden className="flex-1" />

          <div className="relative mt-5" aria-hidden>
            <MiniLane
              className="lane-repaint h-9 w-full"
              years={s.years}
              breaks={s.breaks}
              colour={s.colour}
              from={span[0]}
              to={span[1]}
              ticks={TICKS}
            />
            <div className="relative h-4 text-[11px] text-unmarked">
              {TICKS.filter((t) => t > span[0] && t < span[1]).map((t) => (
                <span
                  key={t}
                  className="numeral absolute -translate-x-1/2"
                  style={{ left: laneTickLeft(t, span[0], span[1]) }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <Counts sport={s} className="mt-2 border-t border-chalk/10 pt-2.5" arrow />
        </div>
      </Link>
    </li>
  )
}

function Row({ sport: s, span }: { sport: SportCard; span: [number, number] }) {
  const c = COLOUR[s.colour] ?? COLOUR.unmarked
  return (
    <li data-flip={s.id}>
      <Link
        href={`/sports/${s.id}/`}
        className="group relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 border-b chalk-rule px-1.5 py-2.5 transition-colors hover:bg-chalk/[0.04] md:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.5fr)_9rem_8.5rem] lg:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.6fr)_11rem_8.5rem]"
      >
        <span
          aria-hidden
          className="absolute inset-y-2.5 left-0 w-[3px] origin-center scale-y-0 transition-transform duration-300 ease-paint group-hover:scale-y-100"
          style={{ background: c.bright }}
        />
        <Pictogram sport={s} className="h-10 w-10" />
        <span className="min-w-0">
          <span className="block font-display text-[23px] leading-tight text-chalk">{s.label}</span>
          <span className="block truncate text-[12.5px] text-unmarked">{s.governingBody}</span>
        </span>
        <span className="hidden md:block">
          <span className="line-clamp-2 text-[14px] leading-snug text-dim">{s.tagline}</span>
        </span>
        <span className="hidden md:block" aria-hidden>
          <MiniLane
            className="h-7 w-full"
            years={s.years}
            breaks={s.breaks}
            colour={s.colour}
            from={span[0]}
            to={span[1]}
            ticks={TICKS}
          />
        </span>
        <Counts sport={s} compact />
      </Link>
    </li>
  )
}

function Counts({
  sport: s,
  className = '',
  compact = false,
  arrow = false,
}: {
  sport: SportCard
  className?: string
  compact?: boolean
  arrow?: boolean
}) {
  const bright = (COLOUR[s.colour] ?? COLOUR.unmarked).bright
  const breaks = s.breaks.length
  return (
    <span
      className={`flex items-baseline gap-x-3.5 whitespace-nowrap text-[12.5px] text-unmarked ${
        compact ? 'flex-col items-end gap-y-0 sm:flex-row sm:items-baseline sm:justify-end' : ''
      } ${className}`}
    >
      <span>
        <span className="numeral mr-1 text-[18px] text-chalk">{s.years.length}</span>
        {s.years.length === 1 ? 'rule' : 'rules'}
      </span>
      <span>
        <span className="numeral mr-1 text-[18px]" style={{ color: bright }}>
          {breaks}
        </span>
        {breaks === 1 ? 'break' : 'breaks'}
      </span>
      {!compact && (
        <span>
          <span className="numeral mr-1 text-[18px] text-chalk">{s.series}</span>series
        </span>
      )}
      {arrow && (
        <span
          aria-hidden
          className="ml-auto text-chalk/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-chalk"
        >
          →
        </span>
      )}
    </span>
  )
}

/** The drawn pictogram, or a dashed monogram that says it is not drawn yet. */
function Pictogram({ sport: s, className }: { sport: SportCard; className: string }) {
  if (hasSportIcon(s.id)) return <SportIcon sport={s.id} colour={s.colour} className={className} />
  return (
    <span
      title="Pictogram not drawn yet"
      className={`grid shrink-0 place-items-center border border-dashed border-chalk/30 font-display text-[18px] text-dim ${className}`}
    >
      {monogram(s.label)}
    </span>
  )
}

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { id: string; label: string }[]
  onChange: (id: string) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex h-11 max-w-full flex-[1_1_auto] overflow-x-auto border border-chalk/25 [scrollbar-width:none] sm:flex-none [&::-webkit-scrollbar]:hidden"
    >
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={`flex-1 whitespace-nowrap border-r border-chalk/10 px-3.5 text-[14px] font-medium transition-colors last:border-r-0 ${
              on ? 'bg-chalk text-ink' : 'text-dim hover:bg-chalk/[0.06] hover:text-chalk'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[14px] font-medium transition-colors duration-300 ${
        pressed
          ? 'border-chalk bg-chalk/10 text-chalk'
          : 'border-chalk/25 text-dim hover:text-chalk'
      }`}
    >
      {children}
    </button>
  )
}
