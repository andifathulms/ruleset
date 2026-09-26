'use client'

import { useState } from 'react'
import Emphasis from '@/components/Emphasis'
import Link from 'next/link'
import type { LawSectionId, Play, Sport } from '@/lib/types'

const COLOUR: Record<string, string> = {
  pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0',
}

/**
 * The same clause read across every covered sport. This is the encyclopedia
 * layer answering the question the timeline asks: sports that look unrelated
 * are answering the same nine questions, and putting their answers in one
 * column makes the differences structural rather than anecdotal.
 */
export default function LawCompare({
  entries,
  sports,
  sections,
}: {
  entries: { sport: string; play: Play }[]
  sports: Sport[]
  sections: { id: LawSectionId; label: string }[]
}) {
  const [active, setActive] = useState<LawSectionId>('scoring')
  const [query, setQuery] = useState('')
  const [all, setAll] = useState(false)
  /* Eight to begin with: seventy-five answers to one question ran to
     13,000px, and the comparison reads from a handful. */
  const FIRST = 8
  const sportMap = Object.fromEntries(sports.map((s) => [s.id, s]))

  const rows = entries
    .map(({ sport, play }) => ({
      sport,
      label: sportMap[sport]?.label ?? sport,
      colour: COLOUR[sportMap[sport]?.family_colour ?? 'unmarked'],
      section: play.sections.find((s) => s.id === active),
    }))
    .filter((r) => r.section)
  const q = query.trim().toLowerCase()
  const matching = rows.filter((r) => !q || r.label.toLowerCase().includes(q))
  const shown = all || q ? matching : matching.slice(0, FIRST)

  return (
    <div>
      {/* The questions stay in reach as the answers scroll past. */}
      <fieldset
        className="sticky z-20 -mx-5 min-w-0 border-b chalk-rule bg-ink/[0.88] px-5 pb-3 pt-3 backdrop-blur-xl"
        style={{ top: 'var(--header-h, 56px)' }}
      >
        <legend className="float-left mb-2 w-full text-[13px] text-unmarked">
          The same question, asked of every sport
        </legend>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-pressed={s.id === active}
              className={`shrink-0 font-display px-3 py-1.5 text-[16px] tracking-wide transition-colors ${
                s.id === active
                  ? 'bg-chalk text-ink'
                  : 'border border-chalk/25 text-chalk/75 hover:border-chalk/60 hover:text-chalk'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex h-10 min-w-0 flex-[0_1_22rem] items-center gap-2.5 border border-chalk/25 bg-chalk/[0.04] px-3 focus-within:border-chalk">
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 opacity-60" aria-hidden>
            <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M11 11l3.6 3.6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span className="sr-only">Find a sport</span>
          <input
            id="law-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a sport"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-chalk outline-none placeholder:text-unmarked [&::-webkit-search-cancel-button]:invert"
          />
        </label>
        <p className="text-[14px] text-unmarked" aria-live="polite">
          <span className="numeral text-chalk">{shown.length}</span> of {rows.length} sports
        </p>
      </div>

      <div className="mt-6 grid gap-px bg-chalk/15 lg:grid-cols-2">
        {shown.map((row) => (
          <article key={row.sport} className="bg-ink p-6">
            <div className="flex items-baseline gap-3">
              <span aria-hidden className="h-3 w-3 shrink-0" style={{ background: row.colour }} />
              <h3 className="font-display text-2xl text-chalk">
                <Link href={`/sports/${row.sport}/#law-${active}`} className="link-paint">
                  {row.label}
                </Link>
              </h3>
              <span className="ml-auto text-[13px] text-unmarked">{row.section!.label}</span>
            </div>

            <div className="mt-3 space-y-3 text-[16px] text-chalk/85">
              {paragraphs(row.section!.body).map((p, i) => (
                <p key={i}><Emphasis>{p}</Emphasis></p>
              ))}
            </div>

            {row.section!.facts && row.section!.facts!.length > 0 && (
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t chalk-rule pt-3">
                {row.section!.facts!.slice(0, 4).map((f, i) => (
                  <div key={`${f.label}-${i}`}>
                    <dt className="text-[12px] text-unmarked">{f.label}</dt>
                    <dd className="numeral text-[17px] text-chalk">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        ))}
        {/* An odd number of sports leaves the grid's gap colour showing as a
            hollow cell in the last row. */}
        {shown.length % 2 === 1 && <div aria-hidden className="hidden bg-ink lg:block" />}
      </div>
      {shown.length === 0 && (
        <p className="mt-6 text-[15px] text-dim">No sport by that name answers this question here.</p>
      )}
      {!q && matching.length > FIRST && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll((v) => !v)}
          className="mt-5 border border-chalk/30 px-4 py-2 text-[14px] text-chalk transition-colors hover:border-chalk"
        >
          {all ? `Show the first ${FIRST} only` : `Show all ${matching.length} answers`}
        </button>
      )}
    </div>
  )
}

const paragraphs = (body: string) =>
  body
    .replace(/[ \t]+/g, ' ')
    .trim()
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
