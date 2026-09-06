'use client'

import { useState } from 'react'
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
  const sportMap = Object.fromEntries(sports.map((s) => [s.id, s]))

  const rows = entries
    .map(({ sport, play }) => ({
      sport,
      label: sportMap[sport]?.label ?? sport,
      colour: COLOUR[sportMap[sport]?.family_colour ?? 'unmarked'],
      section: play.sections.find((s) => s.id === active),
    }))
    .filter((r) => r.section)

  return (
    <div>
      <fieldset>
        <legend className="mb-3 text-[13px] uppercase tracking-[0.14em] text-unmarked">
          The same question, asked of every sport
        </legend>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-pressed={s.id === active}
              className={`font-display px-3 py-1.5 text-[16px] tracking-wide transition-colors ${
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

      <div className="mt-10 grid gap-px bg-chalk/15 lg:grid-cols-2">
        {rows.map((row) => (
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
                <p key={i}>{p}</p>
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
        {rows.length % 2 === 1 && <div aria-hidden className="hidden bg-ink lg:block" />}
      </div>
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
