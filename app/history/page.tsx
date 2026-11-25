import Link from 'next/link'
import type { Metadata } from 'next'
import { card, pageCard } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { siteSchema } from '@/lib/seo'
import Timeline from '@/components/Timeline'
import BreakDiagram from '@/components/BreakDiagram'
import { Counter, Reveal } from '@/components/Motion'
import { BREAK_KIND_LABEL } from '@/lib/series'
import {
  getAllRuleChanges, getAllSeries, getCauses, getLenses, getProgram, getProgrammes, getSources,
  getSports,
} from '@/lib/content'

const KIND_BLURB: Record<string, string> = {
  reset: 'The marks were annulled and the list restarted.',
  retained: 'The rule changed; the old marks were allowed to stand.',
  'scale-change': 'The measurement scale itself was replaced.',
  scoped: 'No series exists for the sport, only for one competition.',
}

export const metadata: Metadata = card({
  title: 'History',
  description:
    'Every recorded rule change across every sport on one time axis, with its cause, its date, its citation, and the breaks it left in the numbers.',
  path: '/history/',
  image: pageCard('history', 'History — Ruleset'),
})

/**
 * The rule-change history, which was the front page until the site became an
 * encyclopedia of how the games are played. The argument is unchanged: laid
 * out together, rule changes cluster by cause, and some of them sever the
 * number series that came before them.
 */
export default function History() {
  const rules = getAllRuleChanges()
  const series = getAllSeries()
  const sports = getSports()
  const sources = getSources()
  const program = getProgram()
  /* Every sport listed on any programme, deduplicated: several appear on all
     three, and a sport counted twice would overstate the skeleton layer. */
  const programmeSports = new Set(
    getProgrammes().flatMap((p) => p.sports.map((s) => s.id)),
  ).size
  const deep = sports.filter((s) => s.coverage === 'deep')
  const broken = series.flatMap(({ sport, series: x }) => x.breaks.map((brk) => ({ sport, series: x, brk })))
  const kinds = Array.from(new Set(broken.map((b) => b.brk.kind)))
  const label = Object.fromEntries(sports.map((s) => [s.id, s.label]))
  const earliest = Math.min(...rules.map((r) => Number(r.date_effective.slice(0, 4))))

  return (
    <>
      <JsonLd data={siteSchema()} />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b chalk-rule">
        <div aria-hidden className="court-grid court-grid-fade absolute inset-0" />

        <div className="relative mx-auto max-w-[86rem] px-5 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <Reveal>
            <p className="eyebrow">
              History · {program.editions.length} Olympic editions · {sources.length} sources cited
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="display-xl mt-5 max-w-[20ch] text-fluid-h1 text-chalk">
              Every sport is a set of rules that someone{' '}
              <span className="relative inline-block">
                changed
                <span
                  aria-hidden
                  className="absolute bottom-[0.1em] left-0 h-[3px] w-full bg-gold-bright"
                />
              </span>
              , for a reason, on a date.
            </h1>
          </Reveal>

          <div className="mt-9 grid gap-x-14 gap-y-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <Reveal delay={160}>
              <div className="prose-measure text-fluid-lead text-chalk/85">
                <p>
                  Wikipedia will tell you that badminton switched to 21-point
                  rally scoring in 2006. It will not tell you that the switch
                  belongs to a wave of scoring rewrites driven by broadcast
                  scheduling, or that it severed every match statistic before it
                  from every one after.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#board"
                  className="group inline-flex items-center gap-3 bg-chalk px-6 py-3 font-display text-lg tracking-wide text-ink transition-colors hover:bg-gold-bright"
                >
                  Open the board
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-y-1"
                  >
                    ↓
                  </span>
                </a>
                <Link
                  href="/breaks/"
                  className="group inline-flex items-center gap-3 border border-chalk/30 px-6 py-3 font-display text-lg tracking-wide text-chalk transition-colors hover:border-chalk"
                >
                  What a break is
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </Reveal>

            {/* The argument, drawn. A line that runs, stops, steps, resumes. */}
            <Reveal delay={240} className="self-end">
              <figure className="panel p-6">
                <BreakDiagram className="h-24" />
                <figcaption className="mt-3 text-[14px] text-dim">
                  A comparability break. The line stops, steps, and resumes on a
                  different baseline. Nothing is ever drawn across the gap.
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* --------------------------------------------------- stat strip */}
          <Reveal delay={300}>
            <dl className="mt-14 grid grid-cols-2 gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-4">
              <Stat n={rules.length} label="rule changes" sub={`since ${earliest}`} />
              <Stat n={deep.length} label="sports researched" sub="every family covered" />
              <Stat n={broken.length} label="comparability breaks" sub={`${kinds.length} kinds`} />
              <Stat
                n={programmeSports}
                label="sports on a programme"
                sub="Olympic, Asian, World"
              />
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- board */}
      <section id="board" className="relative scroll-anchor border-b chalk-rule">
        <div aria-hidden className="court-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-[86rem] px-5 py-16 sm:py-20">
          <Reveal>
            <p className="eyebrow">The timeline</p>
            <h2 className="mt-3 text-fluid-h2 text-chalk">One time axis, every sport at once</h2>
            <p className="prose-measure mt-4 text-fluid-base text-chalk/80">
              {rules.length} rule changes across {deep.length} researched sports.
              One lane per family under the classification lens you pick; cause
              is carried by the shape of the mark, never by a second colour. A
              step in a lane is a{' '}
              <Link href="/breaks/" className="link-paint text-chalk">
                comparability break
              </Link>{' '}
              — the point at which a number series stops being continuous. There
              are {broken.length} of them here.
            </p>
          </Reveal>

          <div className="mt-10">
            <Timeline
              rules={rules}
              series={series}
              lenses={getLenses()}
              causes={getCauses()}
              sports={sports}
              sources={sources}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- breaks */}
      <section className="border-y chalk-rule bg-surface/40">
        <div className="mx-auto max-w-[86rem] px-5 py-16 sm:py-20">
          <Reveal>
            <p className="eyebrow">The consequence</p>
            <h2 className="mt-3 text-fluid-h2 text-chalk">
              Four federations, four different answers
            </h2>
            <p className="prose-measure mt-4 text-fluid-base text-chalk/80">
              A rule change that severs a quantitative series leaves every
              governing body the same choice and gets a different answer each
              time. Which answer is right is not argued here. The distinction
              is recorded, and nothing is drawn across it.
            </p>
          </Reveal>

          <ol className="mt-10 grid gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {['reset', 'retained', 'scale-change', 'scoped'].map((kind, i) => {
              const hit = broken.find((b) => b.brk.kind === kind)
              return (
                <Reveal as="li" key={kind} delay={i * 70} className="bg-ink">
                  <Link
                    href={hit ? `/breaks/#${hit.series.id}` : '/breaks/'}
                    className="group flex h-full flex-col p-6 transition-colors hover:bg-surface"
                  >
                    <span className="numeral text-[15px] text-unmarked">
                      {hit ? hit.brk.at : '—'}
                    </span>
                    <span className="mt-1 font-display text-2xl text-chalk">
                      {BREAK_KIND_LABEL[kind]}
                    </span>
                    <span className="mt-2 flex-1 text-[14px] leading-snug text-chalk/70">
                      {KIND_BLURB[kind]}
                    </span>
                    <span className="mt-5 text-[13px] text-unmarked transition-colors group-hover:text-chalk">
                      {hit ? label[hit.sport] ?? hit.sport : 'see all'} →
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- close */}
      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:py-24">
        <Reveal>
          <p className="prose-measure text-fluid-lead text-chalk/80">
            Read-only, static, and deliberately incomplete. Most citations name
            the right edition without a confirmed article number, and every one
            of those renders as incomplete rather than being quietly finished.
          </p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            <Link href="/sources/" className="link-paint text-chalk">
              How far each citation has been checked
            </Link>
            <Link href="/about/" className="link-paint text-chalk">
              What is never drawn or guessed
            </Link>
          </p>
        </Reveal>
      </section>
    </>
  )
}

function Stat({ n, label, sub }: { n: number; label: string; sub: string }) {
  return (
    <div className="bg-ink px-5 py-6">
      <dd className="numeral text-fluid-h2 leading-none text-chalk">
        <Counter to={n} />
      </dd>
      <dt className="mt-2 text-[15px] text-chalk/80">{label}</dt>
      <p className="mt-0.5 text-[13px] text-unmarked">{sub}</p>
    </div>
  )
}
