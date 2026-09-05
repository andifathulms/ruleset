import Link from 'next/link'
import type { Metadata } from 'next'
import SeriesChart from '@/components/SeriesChart'
import BreakDiagram from '@/components/BreakDiagram'
import { Reveal } from '@/components/Motion'
import { BREAK_KIND_LABEL } from '@/lib/series'
import { getAllRuleChanges, getAllSeries, getSports } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Comparability breaks',
  description:
    'Rule changes that severed a quantitative series, and what each governing body decided to do about it.',
}

const KIND_ORDER = ['reset', 'retained', 'scale-change', 'scoped', 'none']

const COLOUR: Record<string, string> = {
  pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0',
}

export default function BreaksPage() {
  // Baked at build time so the static HTML and the client agree.
  const now = new Date().getFullYear()
  const all = getAllSeries().filter(({ series }) => series.break)
  const rules = Object.fromEntries(getAllRuleChanges().map((r) => [r.id, r]))
  const sports = Object.fromEntries(getSports().map((s) => [s.id, s]))

  const ordered = [...all].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.series.break!.kind) - KIND_ORDER.indexOf(b.series.break!.kind) ||
      a.series.break!.at - b.series.break!.at,
  )

  return (
    <div>
      <header className="relative overflow-hidden border-b chalk-rule">
        <div aria-hidden className="court-grid court-grid-fade absolute inset-0" />
        <div className="relative mx-auto max-w-[86rem] px-5 py-14 sm:py-20">
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center">
            <Reveal>
              <p className="eyebrow">The consequence</p>
              <h1 className="display-xl mt-4 max-w-[15ch] text-fluid-h1 text-chalk">
                Comparability breaks
              </h1>
              <div className="prose-measure mt-6 space-y-4 text-fluid-base text-chalk/85">
                <p>
                  A rule change that severs a quantitative series, so that
                  numbers on either side of it cannot be compared. This is the
                  part nobody records systematically, and it is the reason this
                  site exists.
                </p>
                <p>
                  Nothing here is interpolated, smoothed, or trend-lined across a
                  break. Where a chart cannot exist, the explanation occupies the
                  space the chart would have.
                </p>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <figure className="panel p-6">
                <BreakDiagram className="h-28" />
                <figcaption className="mt-3 text-[14px] text-dim">
                  The two halves do not share a baseline, and the gap is not a
                  gap in the record — it is the record ceasing to be one thing.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[86rem] px-5 py-14 sm:py-16">
        <Reveal>
          <ol className="grid gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {KIND_ORDER.slice(0, 4).map((kind) => {
              const hits = ordered.filter((o) => o.series.break!.kind === kind)
              return (
                <li key={kind} className="bg-ink p-5">
                  <p className="numeral text-fluid-h2 leading-none text-chalk">{hits.length}</p>
                  <p className="mt-2 font-display text-[21px] text-chalk">
                    {BREAK_KIND_LABEL[kind]}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-snug text-unmarked">
                    {KIND_BLURB[kind]}
                  </p>
                  {hits.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                      {hits.map((h) => (
                        <Link
                          key={h.series.id}
                          href={`#${h.series.id}`}
                          className="link-paint text-chalk/70 hover:text-chalk"
                        >
                          {sports[h.sport]?.label ?? h.sport}
                        </Link>
                      ))}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        </Reveal>

        {ordered.map(({ sport, series }, i) => {
          const rule = rules[series.break!.caused_by]
          const s = sports[sport]
          const bright = COLOUR[s?.family_colour ?? 'unmarked'] ?? COLOUR.unmarked
          return (
            <Reveal
              as="section"
              key={series.id}
              delay={40}
              className="mt-16 scroll-mt-24"
            >
              <div id={series.id} className="scroll-mt-24 border chalk-rule bg-surface/40 p-5 sm:p-8">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span
                    className="numeral text-fluid-h3 leading-none"
                    style={{ color: bright }}
                  >
                    {series.break!.at}
                  </span>
                  <span className="eyebrow">
                    {BREAK_KIND_LABEL[series.break!.kind]} · {s?.label ?? sport}
                  </span>
                  <span className="numeral ml-auto text-[13px] text-unmarked">
                    {String(i + 1).padStart(2, '0')} / {String(ordered.length).padStart(2, '0')}
                  </span>
                </div>

                {rule && (
                  <>
                    <h2 className="mt-3 max-w-[26ch] font-display text-fluid-h2 text-chalk">
                      <Link href={`/sports/${sport}/#${rule.id}`} className="link-paint">
                        {headline(rule.what_changed)}
                      </Link>
                    </h2>
                    <p className="prose-measure mt-3 text-[15px] text-unmarked">
                      {rule.governing_body}, effective{' '}
                      <span className="numeral text-chalk/80">{rule.date_effective}</span>. Cause:{' '}
                      {rule.cause_primary}.
                    </p>
                  </>
                )}

                <SeriesChart series={series} colour={s?.family_colour ?? 'unmarked'} now={now} />
              </div>
            </Reveal>
          )
        })}

        <Reveal as="section" className="mt-20 border-t chalk-rule pt-12">
          <p className="eyebrow">The comparison this site was built to make</p>
          <h2 className="mt-3 max-w-[22ch] font-display text-fluid-h2 text-chalk">
            The same facts, opposite rulings
          </h2>
          <div className="mt-8 grid gap-px border chalk-rule bg-chalk/[0.08] md:grid-cols-2">
            <div className="bg-ink p-6 sm:p-8">
              <p className="numeral text-fluid-h3 text-pool-bright">1986</p>
              <p className="mt-1 font-display text-2xl text-chalk">World Athletics</p>
              <p className="mt-3 text-[16px] leading-relaxed text-chalk/80">
                Redesigned the javelin and annulled the record list. A series
                that is not comparable is not a series, so the list restarted at
                zero and Uwe Hohn&rsquo;s 104.80 m sits outside it permanently.
              </p>
            </div>
            <div className="bg-ink p-6 sm:p-8">
              <p className="numeral text-fluid-h3 text-pool-bright">2010</p>
              <p className="mt-1 font-display text-2xl text-chalk">World Aquatics</p>
              <p className="mt-3 text-[16px] leading-relaxed text-chalk/80">
                Banned polyurethane suits and let every record set in them stand.
                A record is a ranking of performances that were legal when they
                were set — which is why several of them are still unbeaten.
              </p>
            </div>
          </div>
          <div className="prose-measure mt-8 space-y-4 text-fluid-base text-chalk/85">
            <p>
              Both federations faced a technology that had made their existing
              marks unreachable by ordinary means, and both acted; only one of
              them touched the record book. The difference is what each thought a
              record was for.
            </p>
            <p className="text-unmarked">
              This site takes no position on which is right. It only insists that
              the distinction is recorded, because a chart that hides it is
              making the claim silently.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

/** The first sentence, trimmed to something that sets on two lines at display size. */
function headline(text: string): string {
  const first = text.trim().split(/(?<=\.)\s/)[0]
  return first.length > 104 ? `${first.slice(0, 101).trimEnd()}…` : first
}

const KIND_BLURB: Record<string, string> = {
  reset: 'The marks were annulled and the list restarted.',
  retained: 'The rule changed and the old marks were allowed to stand.',
  'scale-change': 'The measurement scale itself was replaced. No mapping exists.',
  scoped: 'No series exists for the sport; the series belongs to one competition.',
}
