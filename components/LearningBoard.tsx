import Link from 'next/link'
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
 */
export default function LearningBoard({
  entries, sports,
}: {
  entries: { sport: string; learning: Learning }[]
  sports: Sport[]
}) {
  const sportMap = Object.fromEntries(sports.map((s) => [s.id, s]))
  const steps = DIFFICULTY.length

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
      <p className="mb-5 inline-flex items-center gap-2 border border-unmarked px-3 py-1 text-[13px] uppercase tracking-[0.14em] text-unmarked">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-unmarked" />
        Editorial — five-point ordinals, never summed or averaged
      </p>

      <ol className="grid gap-px bg-chalk/15">
        {rows.map((row) => (
          <li key={row.sport} className="bg-ink p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span aria-hidden className="h-3 w-3 shrink-0" style={{ background: row.colour }} />
              <h3 className="font-display text-2xl text-chalk">
                <Link href={`/sports/${row.sport}/#learning`} className="link-paint">
                  {row.label}
                </Link>
              </h3>
              <span className="ml-auto text-[14px] text-unmarked">
                {DIFFICULTY_LABEL[DIFFICULTY[row.entry]]} to start ·{' '}
                {DIFFICULTY_LABEL[DIFFICULTY[row.mastery]]} at the top
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <Bar label="To start" at={row.entry} steps={steps} colour={row.colour} />
              <Bar label="At the top" at={row.mastery} steps={steps} colour={row.colour} />
            </div>
          </li>
        ))}
      </ol>

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
      <span className="w-24 shrink-0 text-[13px] text-unmarked">{label}</span>
      <span
        className="flex flex-1 gap-1.5"
        role="img"
        aria-label={`${label}: ${DIFFICULTY_LABEL[DIFFICULTY[at]]}, step ${at + 1} of ${steps}`}
      >
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="h-2.5 flex-1"
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
