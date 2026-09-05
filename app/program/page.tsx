import Link from 'next/link'
import type { Metadata } from 'next'
import { getProgram, getSources } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Olympic programme',
  description: 'Every sport on the Games of the Olympiad, with its status per edition. Status data only.',
}

export default function ProgramPage() {
  const program = getProgram()
  const source = getSources().find((s) => s.id === program.source)
  const years = program.editions.map((e) => e.year)

  const sports = [...program.sports].sort((a, b) => {
    if (a.coverage !== b.coverage) return a.coverage === 'deep' ? -1 : 1
    return b.held.length - a.held.length || a.label.localeCompare(b.label)
  })

  return (
    <div className="mx-auto max-w-[100rem] px-5 py-10 sm:py-14">
      <h1 className="font-display text-5xl text-chalk">The Olympic programme</h1>
      <div className="prose-measure mt-4 space-y-4 text-[17px] text-chalk/85">
        <p>
          Every sport contested at the Games of the Olympiad, with its status per
          edition. This is the skeleton layer: structured data, not research.
        </p>
        <p className="text-unmarked">
          Nothing on this page carries a cause or a rule citation, and no sport
          here should be read as researched merely because it appears in a table
          next to one that is. Sourced to{' '}
          {source?.url ? (
            <a href={source.url} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
          ) : (
            source?.title
          )}
          , last reviewed {program.last_reviewed}.
        </p>
      </div>

      {/* border-separate, not border-collapse: a sticky cell inside a
          collapsed-border table leaks its width to the root scroller in
          Chromium, which made the whole page scroll sideways on a phone. */}
      {/* `relative` is load-bearing. The sr-only cell text is absolutely
          positioned, so without a positioned ancestor its containing block is
          the viewport, it escapes this container's clipping, and ~700 of them
          drag the whole page into a horizontal scroll on a phone. */}
      <div className="relative mt-10 max-w-full overflow-x-auto border chalk-rule">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <caption className="sr-only">
            Olympic status per sport per edition. A filled cell means the sport
            was contested at that Games.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-surface px-3 py-2 text-left font-display text-[15px] font-normal text-chalk">
                Sport
              </th>
              {program.editions.map((e) => (
                <th
                  key={e.year}
                  scope="col"
                  className="numeral px-1 py-2 text-center text-[12px] font-normal text-chalk/60"
                >
                  <span title={`${e.city}${e.note ? ` — ${e.note}` : ''}`}>
                    {String(e.year).slice(2)}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-3 py-2 text-right font-normal text-unmarked">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sports.map((sport) => {
              const held = new Set(sport.held)
              return (
                <tr key={sport.id}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-t chalk-rule bg-surface px-3 py-1.5 text-left text-[14px] font-normal"
                  >
                    {sport.coverage === 'deep' ? (
                      <Link href={`/sports/${sport.id}/`} className="text-chalk underline underline-offset-4">
                        {sport.label}
                      </Link>
                    ) : (
                      <span className="text-unmarked" title="Not yet covered — status data only">
                        {sport.label}
                      </span>
                    )}
                  </th>
                  {years.map((y) => (
                    <td key={y} className="border-t chalk-rule px-1 py-1.5 text-center">
                      {held.has(y) ? (
                        <span
                          className={`mx-auto block h-2.5 w-2.5 ${
                            sport.coverage === 'deep' ? 'bg-chalk' : 'bg-unmarked'
                          }`}
                          title={`${sport.label}, ${y}`}
                        >
                          <span className="sr-only">contested {y}</span>
                        </span>
                      ) : null /* An empty cell is legitimately empty; saying
                          "absent" 700 times is noise, and the row and column
                          headers already carry the context. */}
                    </td>
                  ))}
                  <td className="numeral border-t chalk-rule px-3 py-1.5 text-right text-chalk/70">
                    {sport.held.length}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 font-display text-3xl text-chalk">Absences worth noticing</h2>
      <ul className="prose-measure mt-4 space-y-3 text-[16px] text-chalk/85">
        {sports
          .filter((s) => s.note)
          .map((s) => (
            <li key={s.id}>
              <span className="font-display text-[19px] text-chalk">{s.label}</span>
              {' — '}
              {s.note}
            </li>
          ))}
      </ul>
    </div>
  )
}
