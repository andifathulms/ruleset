import Link from 'next/link'
import type { Metadata } from 'next'
import MiniLane from '@/components/MiniLane'
import { Reveal } from '@/components/Motion'
import {
  getAllRuleChanges, getAllSeries, getProgram, getSports,
} from '@/lib/content'

export const metadata: Metadata = {
  title: 'Sports',
  description: 'Two layers, marked as such: the researched sports, and the rest of the Olympic programme as status data only.',
}

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

export default function SportsIndex() {
  const deep = getSports()
  const program = getProgram()
  const rules = getAllRuleChanges()
  const series = getAllSeries()
  const skeletonOnly = program.sports.filter((s) => s.coverage === 'skeleton')
  const editions = program.editions.length
  const span: [number, number] = [
    Math.min(...rules.map((r) => Number(r.date_effective.slice(0, 4)))) - 4,
    Math.max(...rules.map((r) => Number(r.date_effective.slice(0, 4)))) + 4,
  ]

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-12 sm:py-16">
      <Reveal>
        <p className="eyebrow">Two layers, marked as such</p>
        <h1 className="display-xl mt-4 max-w-[16ch] text-fluid-h1 text-chalk">Sports</h1>
        <p className="prose-measure mt-5 text-fluid-lead text-chalk/85">
          {deep.length} sports have researched rule changes with a cause and a
          citation apiece. The other {skeletonOnly.length} are present as Olympic
          status data only and carry none of that authority.
        </p>
      </Reveal>

      <section className="mt-16">
        <Reveal>
          <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
            Researched
            <span className="numeral text-[18px] text-unmarked">{deep.length}</span>
            <span aria-hidden className="h-px flex-1 bg-chalk/15" />
          </h2>
        </Reveal>

        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deep.map((s, i) => {
            const c = COLOUR[s.family_colour] ?? COLOUR.unmarked
            const own = rules.filter((r) => r.scope.sport === s.id)
            const ownSeries = series.filter((x) => x.sport === s.id)
            const breakYears = ownSeries
              .filter((x) => x.series.break)
              .map((x) => x.series.break!.at)
            return (
              <Reveal as="li" key={s.id} delay={i * 70}>
                <Link
                  href={`/sports/${s.id}/`}
                  className="lift group relative flex h-full flex-col overflow-hidden border border-chalk/[0.12] bg-surface/50 hover:border-chalk/35 hover:bg-surface"
                >
                  <span aria-hidden className="block h-1 w-full" style={{ background: c.bright }} />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(26rem 15rem at 50% 0%, ${c.base}38, transparent 72%)`,
                    }}
                  />
                  <div className="relative flex flex-1 flex-col p-6">
                    <h3 className="font-display text-fluid-h3 text-chalk">{s.label}</h3>
                    <p className="mt-2 flex-1 text-[15px] leading-snug text-chalk/75">
                      {s.tagline}
                    </p>

                    {/* The sport's own lane at card size, with its breaks in it. */}
                    <MiniLane
                      className="mt-6 h-9 w-full"
                      years={own.map((r) => Number(r.date_effective.slice(0, 4)))}
                      breaks={breakYears}
                      colour={s.family_colour}
                      from={span[0]}
                      to={span[1]}
                    />

                    <dl className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-chalk/10 pt-3 text-[13px] text-unmarked">
                      <div className="flex items-baseline gap-1.5">
                        <dd className="numeral text-[17px] text-chalk">{own.length}</dd>
                        <dt>rules</dt>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <dd className="numeral text-[17px]" style={{ color: c.bright }}>
                          {breakYears.length}
                        </dd>
                        <dt>breaks</dt>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <dd className="numeral text-[17px] text-chalk">{ownSeries.length}</dd>
                        <dt>series</dt>
                      </div>
                      <span className="ml-auto text-chalk/60 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </dl>
                    <p className="mt-3 text-[13px] text-unmarked">{s.governing_body}</p>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-unmarked-bright">
            Not yet covered
            <span className="numeral text-[18px] text-unmarked">{skeletonOnly.length}</span>
            <span aria-hidden className="h-px flex-1 bg-chalk/10" />
          </h2>
          <p className="prose-measure mt-4 text-fluid-base text-unmarked">
            Status and classification only. No rule research has been done on
            these, and nothing here should be read as though it had. The bar is
            how many of the {editions} editions each was contested at — the only
            thing this site actually knows about them.
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {skeletonOnly.map((s, i) => (
            <Reveal as="li" key={s.id} delay={Math.min(i, 12) * 25}>
              <Link
                href="/program/"
                className="group flex items-center gap-3 border-b border-chalk/[0.08] py-2 transition-colors hover:border-chalk/30"
              >
                <span className="min-w-0 flex-1 truncate text-[15px] text-unmarked transition-colors group-hover:text-chalk">
                  {s.label}
                </span>
                <span aria-hidden className="h-[3px] w-20 shrink-0 bg-chalk/[0.07]">
                  <span
                    className="block h-full bg-unmarked-bright/70 transition-colors group-hover:bg-chalk"
                    style={{ width: `${(s.held.length / editions) * 100}%` }}
                  />
                </span>
                <span className="numeral w-7 shrink-0 text-right text-[13px] text-unmarked">
                  {s.held.length}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  )
}
