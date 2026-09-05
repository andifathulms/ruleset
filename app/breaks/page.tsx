import Link from 'next/link'
import type { Metadata } from 'next'
import SeriesChart from '@/components/SeriesChart'
import { BREAK_KIND_LABEL } from '@/lib/series'
import { getAllRuleChanges, getAllSeries, getSports } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Comparability breaks',
  description: 'Rule changes that severed a quantitative series, and what each governing body decided to do about it.',
}

const KIND_ORDER = ['reset', 'retained', 'scale-change', 'scoped', 'none']

export default function BreaksPage() {
  const all = getAllSeries().filter(({ series }) => series.break)
  const rules = Object.fromEntries(getAllRuleChanges().map((r) => [r.id, r]))
  const sports = Object.fromEntries(getSports().map((s) => [s.id, s]))

  const ordered = [...all].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.series.break!.kind) - KIND_ORDER.indexOf(b.series.break!.kind) ||
      a.series.break!.at - b.series.break!.at,
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-5xl text-chalk">Comparability breaks</h1>
      <div className="prose-measure mt-4 space-y-4 text-[17px] text-chalk/85">
        <p>
          A rule change that severs a quantitative series, so that numbers on
          either side of it cannot be compared. This is the part nobody records
          systematically, and it is the reason this site exists.
        </p>
        <p>
          Nothing here is interpolated, smoothed, or trend-lined across a break.
          Where a chart cannot exist, the explanation occupies the space the
          chart would have.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KIND_ORDER.slice(0, 4).map((kind) => {
          const n = ordered.filter((o) => o.series.break!.kind === kind).length
          return (
            <div key={kind} className="border-t-2 border-chalk/40 pt-3">
              <p className="numeral text-3xl text-chalk">{n}</p>
              <p className="font-display text-[19px] text-chalk">{BREAK_KIND_LABEL[kind]}</p>
              <p className="mt-1 text-[14px] text-unmarked">{KIND_BLURB[kind]}</p>
            </div>
          )
        })}
      </div>

      {ordered.map(({ sport, series }) => {
        const rule = rules[series.break!.caused_by]
        const s = sports[sport]
        return (
          <section key={series.id} id={series.id} className="mt-16 scroll-mt-8 border-t chalk-rule pt-10">
            <p className="text-[14px] uppercase tracking-[0.14em] text-unmarked">
              {BREAK_KIND_LABEL[series.break!.kind]} · {s?.label ?? sport} ·{' '}
              <span className="numeral">{series.break!.at}</span>
            </p>
            {rule && (
              <>
                <h2 className="mt-2 font-display text-4xl text-chalk">
                  <Link href={`/sports/${sport}/#${rule.id}`} className="hover:underline">
                    {rule.what_changed.trim().split(/(?<=\.)\s/)[0]}
                  </Link>
                </h2>
                <p className="prose-measure mt-3 text-[16px] text-unmarked">
                  {rule.governing_body}, effective{' '}
                  <span className="numeral">{rule.date_effective}</span>. Cause:{' '}
                  {rule.cause_primary}.
                </p>
              </>
            )}
            <SeriesChart series={series} colour={s?.family_colour ?? 'unmarked'} />
          </section>
        )
      })}

      <section className="mt-16 border-t chalk-rule pt-10">
        <h2 className="font-display text-3xl text-chalk">The same facts, opposite rulings</h2>
        <div className="prose-measure mt-4 space-y-4 text-[17px] text-chalk/85">
          <p>
            In 1986 World Athletics redesigned the javelin and annulled the
            record list. In 2010 World Aquatics banned polyurethane suits and
            let every record set in them stand. Both federations faced a
            technology that had made their existing marks unreachable by ordinary
            means, and both acted; only one of them touched the record book.
          </p>
          <p>
            The difference is what each thought a record was for. Swimming
            treated it as a ranking of performances that were legal when they
            were set. Athletics treated it as a comparable series, and a series
            that is not comparable is not a series.
          </p>
          <p className="text-unmarked">
            This site takes no position on which is right. It only insists that
            the distinction is recorded, because a chart that hides it is making
            the claim silently.
          </p>
        </div>
      </section>
    </div>
  )
}

const KIND_BLURB: Record<string, string> = {
  reset: 'The marks were annulled and the list restarted.',
  retained: 'The rule changed and the old marks were allowed to stand.',
  'scale-change': 'The measurement scale itself was replaced. No mapping exists.',
  scoped: 'No series exists for the sport; the series belongs to one competition.',
}
