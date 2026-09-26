'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DIFFICULTY, DIFFICULTY_LABEL, type Learning, type Sport } from '@/lib/types'

const COLOUR: Record<string, string> = {
  pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0',
}

/**
 * Both verdicts for every sport on one board, read as two rows rather than
 * plotted as points on a scatter. The values are five-point ordinals, so a
 * scatter would put them at coordinates and invite the eye to measure distances
 * between them — which is precisely the arithmetic these values cannot support.
 * Two aligned scales compare fine and claim nothing extra.
 *
 * One line per sport, the two scales side by side, and the widest gaps first
 * with the rest a click away: seventy-five stacked cards ran to 11,000px.
 */
export default function LearningBoard({
  entries, sports,
}: {
  entries: { sport: string; learning: Learning }[]
  sports: Sport[]
}) {
  const sportMap = Object.fromEntries(sports.map((s) => [s.id, s]))
  const steps = DIFFICULTY.length
  const [all, setAll] = useState(false)
  const FIRST = 12

  const rows = entries
    .map(({ sport, learning }) => ({
      sport,
      label: sportMap[sport]?.label ?? sport,
      colour: COLOUR[sportMap[sport]?.family_colour ?? 'unmarked'],
      entry: DIFFICULTY.indexOf(learning.entry.verdict),
      mastery: DIFFICULTY.indexOf(learning.mastery.verdict),
      gapClaim: learning.entry.claim,
    }))
    // Widest gap first: the gap is the finding, so it sets the order.
    .sort((a, b) => b.mastery - b.entry - (a.mastery - a.entry))

  return (
    <div className="mt-8">
      <p className="mb-5 inline-flex items-center gap-2 border border-unmarked px-3 py-1 text-[13px] text-unmarked">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-unmarked" />
        Editorial — five-point ordinals, never summed or averaged
      </p>

      <div className="hidden grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,1fr)] gap-x-6 border-b chalk-rule pb-2 text-[13px] text-unmarked md:grid">
        <span>Sport</span>
        <span>To start</span>
        <span>At the top</span>
      </div>
      <ol>
        {(all ? rows : rows.slice(0, FIRST)).map((row) => (
          <li
            key={row.sport}
            className="grid grid-cols-1 items-center gap-x-6 gap-y-2 border-b chalk-rule py-3 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <h3 className="flex items-center gap-2.5 font-display text-[21px] leading-tight text-chalk">
              <span aria-hidden className="h-2.5 w-2.5 shrink-0" style={{ background: row.colour }} />
              <Link href={`/sports/${row.sport}/#learning`} className="link-paint">
                {row.label}
              </Link>
            </h3>
            {/* No gap figure: these are ordinals, and a difference between
                two of them is exactly the arithmetic they cannot support.
                The order carries the gap instead. */}
            <Bar label="To start" at={row.entry} steps={steps} colour={row.colour} />
            <Bar label="At the top" at={row.mastery} steps={steps} colour={row.colour} />
          </li>
        ))}
      </ol>
      {rows.length > FIRST && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll((v) => !v)}
          className="mt-5 border border-chalk/30 px-4 py-2 text-[14px] text-chalk transition-colors hover:border-chalk"
        >
          {all ? `Show the widest ${FIRST} only` : `Show all ${rows.length} sports`}
        </button>
      )}

      <p className="mt-4 text-[13px] text-unmarked">
        Ordered by the size of the gap, widest first. The scale runs{' '}
        {DIFFICULTY.map((d) => DIFFICULTY_LABEL[d].toLowerCase()).join(' · ')}.
      </p>
    </div>
  )
}

function Bar({
  label, at, steps, colour,
}: {
  label: string
  at: number
  steps: number
  colour: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-[12.5px] text-unmarked md:sr-only">{label}</span>
      <span
        className="flex flex-1 gap-1.5"
        role="img"
        aria-label={`${label}: ${DIFFICULTY_LABEL[DIFFICULTY[at]]}, step ${at + 1} of ${steps}`}
      >
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="h-2 flex-1"
            style={{
              background: i <= at ? colour : 'rgb(242 245 241 / 0.12)',
              opacity: i <= at ? 1 - (at - i) * 0.13 : 1,
            }}
          />
        ))}
      </span>
    </div>
  )
}
