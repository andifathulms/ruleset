'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Program, Source } from '@/lib/types'

/**
 * The skeleton layer, for every programme rather than only the Olympic one.
 *
 * The switcher is the argument: the same sport is a permanent fixture on one
 * programme, a lapsed entry on another and the headline act on a third, and
 * that is only visible if the three tables sit at one address. Rule 6 still
 * holds throughout — nothing on this board carries a cause or a citation.
 */
export default function ProgrammeBoard({
  programmes,
  sources,
}: {
  programmes: Program[]
  sources: Source[]
}) {
  const [id, setId] = useState(programmes[0]?.id ?? 'olympic')
  const programme = programmes.find((p) => p.id === id) ?? programmes[0]
  const index = Math.max(0, programmes.findIndex((p) => p.id === programme.id))
  const source = sources.find((s) => s.id === programme.source)

  const years = programme.editions.map((e) => e.year)
  const entered = new Set(programme.entered)
  const deepCount = programme.sports.filter((s) => s.coverage === 'deep').length

  /* Column headers are two digits or the table will not fit, and across
     1896–2028 that made sixteen of the thirty-one columns ambiguous: 96, 00,
     04, 08, 12, 20, 24 and 28 each name two different Games. A band above the
     digits says which century you are reading. */
  const centuries = [
    programme.editions.filter((e) => e.year < 2000),
    programme.editions.filter((e) => e.year >= 2000),
  ].filter((c) => c.length > 0)
  const firstOf2000 = centuries.length > 1 ? 2000 : null

  const sports = [...programme.sports].sort((a, b) => {
    if (a.coverage !== b.coverage) return a.coverage === 'deep' ? -1 : 1
    return b.held.length - a.held.length || a.label.localeCompare(b.label)
  })

  const partial = programme.entered.length < programme.editions.length

  return (
    <div>
      <fieldset className="mt-10">
        <legend className="eyebrow mb-2.5">Programme</legend>
        <div
          className="relative grid max-w-2xl border border-chalk/20 p-1"
          style={{ gridTemplateColumns: `repeat(${programmes.length}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden
            className="absolute bottom-1 top-1 bg-chalk transition-transform duration-500 ease-swing"
            style={{
              width: `calc((100% - 0.5rem) / ${programmes.length})`,
              transform: `translateX(${index * 100}%)`,
              left: '0.25rem',
            }}
          />
          {programmes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setId(p.id)}
              aria-pressed={p.id === programme.id}
              className={`relative z-10 whitespace-nowrap px-4 py-1.5 font-display text-[16px] tracking-wide transition-colors duration-300 ${
                p.id === programme.id ? 'text-ink' : 'text-chalk/70 hover:text-chalk'
              }`}
            >
              {p.short}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="prose-measure mt-5 text-fluid-base text-chalk/85">{clean(programme.blurb)}</p>
      <p className="prose-measure mt-3 text-[15px] text-unmarked">
        Organised by {programme.organiser}. Nothing on this table carries a cause or a rule
        citation, and no sport here should be read as researched merely because it appears in a
        row next to one that is. Sourced to{' '}
        {source?.url ? (
          <a
            href={source.url}
            className="link-paint text-chalk"
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.title}
          </a>
        ) : (
          source?.title ?? programme.source
        )}
        , last reviewed {programme.last_reviewed}.
      </p>

      {programme.caveat && (
        <p className="mt-5 border border-dashed border-unmarked/60 bg-unmarked/[0.06] p-4 text-[15px] leading-snug text-unmarked">
          <strong className="font-normal text-chalk/85">Entered from general reference.</strong>{' '}
          {clean(programme.caveat)}
        </p>
      )}

      <dl className="mt-8 grid gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-3">
        <Stat
          n={programme.editions.length}
          label="editions"
          sub={`${years[0]} to ${years[years.length - 1]}`}
        />
        <Stat n={programme.sports.length} label="sports listed" sub="ever contested" />
        <Stat n={deepCount} label="researched here" sub="the rest are status only" />
      </dl>

      {partial && (
        <p className="mt-4 border-l-2 border-unmarked/60 py-1 pl-4 text-[15px] leading-snug text-unmarked">
          Only {programme.entered.join(', ')} {programme.entered.length === 1 ? 'has' : 'have'} been
          entered from a source. The earlier columns are hatched because nobody has checked them —
          they are not a record of absence, and this site will not draw them as one.
        </p>
      )}

      {/* border-separate, not border-collapse: a sticky cell inside a
          collapsed-border table leaks its width to the root scroller in
          Chromium, which made the whole page scroll sideways on a phone. */}
      {/* `relative` is load-bearing. The sr-only cell text is absolutely
          positioned, so without a positioned ancestor its containing block is
          the viewport, it escapes this container's clipping, and ~700 of them
          drag the whole page into a horizontal scroll on a phone. */}
      <div className="relative mt-6 max-w-full overflow-x-auto border chalk-rule bg-surface/30">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <caption className="sr-only">
            {programme.label} status per sport per edition. A filled cell means the sport was
            contested at that edition.
          </caption>
          <thead>
            <tr>
              <th
                rowSpan={2}
                scope="col"
                className="sticky left-0 z-10 bg-ink px-3 py-2.5 text-left align-bottom font-display text-[15px] font-normal text-chalk"
              >
                Sport
              </th>
              {centuries.map((c, i) => (
                <th
                  key={c[0].year}
                  colSpan={c.length}
                  scope="colgroup"
                  className={`numeral px-1 pb-1 pt-2.5 text-center text-[12px] font-normal text-unmarked ${
                    i > 0 ? 'shadow-[inset_1px_0_0_rgb(242_245_241_/_0.13)]' : ''
                  }`}
                >
                  {c[0].year}&ndash;{c[c.length - 1].year}
                </th>
              ))}
              <th
                rowSpan={2}
                scope="col"
                className="px-3 py-2.5 text-right align-bottom font-normal text-unmarked"
              >
                Total
              </th>
            </tr>
            <tr>
              {programme.editions.map((e) => (
                <th
                  key={e.year}
                  scope="col"
                  className={`numeral px-1 pb-2.5 text-center text-[12px] font-normal ${
                    entered.has(e.year) ? 'text-chalk/65' : 'text-unmarked/50'
                  } ${e.year === firstOf2000 ? 'shadow-[inset_1px_0_0_rgb(242_245_241_/_0.13)]' : ''}`}
                >
                  <span
                    title={`${e.year} — ${e.city}${e.note ? ` — ${e.note}` : ''}${
                      entered.has(e.year) ? '' : ' — roster not entered'
                    }`}
                  >
                    {String(e.year).slice(2)}
                  </span>
                  <span className="sr-only">{e.year}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sports.map((sport) => {
              const held = new Set(sport.held)
              return (
                <tr key={sport.id} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-t chalk-rule bg-ink px-3 py-1.5 text-left text-[14px] font-normal transition-colors group-hover:bg-raised"
                  >
                    {sport.coverage === 'deep' ? (
                      <Link href={`/sports/${sport.id}/`} className="link-paint text-chalk">
                        {sport.label}
                      </Link>
                    ) : (
                      <span className="text-unmarked" title="Not yet covered — status data only">
                        {sport.label}
                      </span>
                    )}
                  </th>
                  {years.map((y) => (
                    <td
                      key={y}
                      className={`border-t chalk-rule px-1 py-1.5 text-center transition-colors group-hover:bg-chalk/[0.04] ${
                        y === firstOf2000 ? 'shadow-[inset_1px_0_0_rgb(242_245_241_/_0.13)]' : ''
                      } ${entered.has(y) ? '' : 'unentered'}`}
                    >
                      {held.has(y) ? (
                        <span
                          className={`mx-auto block h-2.5 w-2.5 transition-transform duration-300 group-hover:scale-125 ${
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
                  <td className="numeral border-t chalk-rule px-3 py-1.5 text-right text-[15px] text-chalk/70 transition-colors group-hover:bg-chalk/[0.04]">
                    {sport.held.length}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[13px] text-unmarked">
        A filled cell means the sport was contested at that edition. Bright cells are the
        researched sports; grey ones are status data only.
        {partial && ' Hatched columns have not been entered from a source.'}
      </p>

      <section className="mt-16">
        <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
          Absences worth noticing
          <span aria-hidden className="h-px flex-1 bg-chalk/15" />
        </h2>
        <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {sports
            .filter((s) => s.note)
            .map((s) => (
              <li key={s.id} className="border-l-2 border-chalk/20 pl-5">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-[21px] text-chalk">{s.label}</span>
                  <span className="numeral text-[13px] text-unmarked">
                    {s.held.length} edition{s.held.length === 1 ? '' : 's'}
                  </span>
                </p>
                <p className="mt-1 text-[15px] leading-snug text-chalk/75">{s.note}</p>
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}

function Stat({ n, label, sub }: { n: number; label: string; sub: string }) {
  return (
    <div className="bg-ink px-5 py-5">
      <dd className="numeral text-fluid-h3 leading-none text-chalk">{n}</dd>
      <dt className="mt-1.5 text-[15px] text-chalk/80">{label}</dt>
      <p className="mt-0.5 text-[13px] text-unmarked">{sub}</p>
    </div>
  )
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
