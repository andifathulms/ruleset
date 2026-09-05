import Link from 'next/link'
import Timeline from '@/components/Timeline'
import {
  getAllRuleChanges, getAllSeries, getCauses, getLenses, getSources, getSports,
} from '@/lib/content'

export default function Home() {
  const rules = getAllRuleChanges()
  const series = getAllSeries()
  const sports = getSports()
  const deep = sports.filter((s) => s.coverage === 'deep')
  const breaks = series.filter((s) => s.series.break).length

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <section className="prose-measure">
        <h1 className="font-display text-5xl leading-[0.95] text-chalk sm:text-6xl">
          Every sport is a set of rules that someone changed, for a reason, on a date.
        </h1>
        <p className="mt-5 text-[17px] text-chalk/85">
          Wikipedia will tell you that badminton switched to 21-point rally
          scoring in 2006. It will not tell you that the switch belongs to a wave
          of scoring rewrites driven by broadcast scheduling, or that it severed
          every match statistic before it from every one after.
        </p>
        <p className="mt-4 text-[17px] text-chalk/85">
          Below, {rules.length} rule changes across {deep.length} researched
          sports on one time axis. One lane per family. Cause is carried by the
          shape of the mark. A step in a lane is a{' '}
          <Link href="/breaks/" className="text-chalk underline underline-offset-4">
            comparability break
          </Link>
          {' '}&mdash; the point at which a number series stops being continuous.
          There are {breaks} of them here, and nothing is ever drawn across one.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="board">
        <h2 id="board" className="sr-only">
          Cross-sport rule change timeline
        </h2>
        <Timeline
          rules={rules}
          series={series}
          lenses={getLenses()}
          causes={getCauses()}
          sports={sports}
          sources={getSources()}
        />
      </section>

      <section className="mt-16 grid gap-8 border-t chalk-rule pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {deep.map((s) => (
          <Link
            key={s.id}
            href={`/sports/${s.id}/`}
            className="group block border-l-4 pl-4"
            style={{ borderColor: colourOf(s.family_colour) }}
          >
            <h3 className="font-display text-2xl text-chalk group-hover:underline">{s.label}</h3>
            <p className="mt-1 text-[15px] text-chalk/70">{s.tagline}</p>
          </Link>
        ))}
      </section>

      <section className="mt-14 border-t chalk-rule pt-10">
        <p className="prose-measure text-[15px] text-unmarked">
          The rest of the Olympic programme is here too, as{' '}
          <Link href="/program/" className="text-chalk underline underline-offset-4">
            status data only
          </Link>
          . Those sports carry no causes and no rule citations, and they say so.
        </p>
      </section>
    </div>
  )
}

function colourOf(c: string): string {
  return (
    { pool: '#1D6FA8', pitch: '#2F7D4F', clay: '#B7502A', gold: '#C8A02C', unmarked: '#7A8C8A' }[c] ??
    '#7A8C8A'
  )
}
