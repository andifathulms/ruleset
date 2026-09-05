import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Prose from '@/components/Prose'
import SeriesChart from '@/components/SeriesChart'
import RuleList from '@/components/RuleList'
import {
  getCauses, getLenses, getProgram, getRuleChanges, getSections, getSeriesForSport,
  getSourceMap, getSport, getSportIds,
} from '@/lib/content'

const COLOUR: Record<string, string> = {
  pool: '#1D6FA8', pitch: '#2F7D4F', clay: '#B7502A', gold: '#C8A02C', unmarked: '#7A8C8A',
}

export function generateStaticParams() {
  return getSportIds().map((sport) => ({ sport }))
}

export function generateMetadata({ params }: { params: { sport: string } }): Metadata {
  try {
    const sport = getSport(params.sport)
    return { title: sport.label, description: sport.tagline }
  } catch {
    return { title: 'Sport' }
  }
}

export default function SportPage({ params }: { params: { sport: string } }) {
  if (!getSportIds().includes(params.sport)) notFound()

  const sport = getSport(params.sport)
  const rules = getRuleChanges(params.sport)
  const series = getSeriesForSport(params.sport)
  const sections = getSections(params.sport)
  const lenses = getLenses()
  const program = getProgram().sports.find((s) => s.id === params.sport)
  const tint = COLOUR[sport.family_colour] ?? COLOUR.unmarked

  return (
    <article>
      {/* 1. Identity, governing body, current status in the Olympic programme. */}
      <header className="border-b chalk-rule" style={{ background: `${tint}22` }}>
        <div className="mx-auto max-w-6xl px-5 py-12">
          <span aria-hidden className="mb-4 block h-1.5 w-24" style={{ background: tint }} />
          <h1 className="font-display text-6xl leading-none text-chalk">{sport.label}</h1>
          <p className="prose-measure mt-4 text-[18px] text-chalk/85">{sport.tagline}</p>

          <dl className="mt-8 grid gap-x-10 gap-y-4 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-unmarked">Governing body</dt>
              <dd className="text-chalk">{sport.governing_body}</dd>
            </div>
            <div>
              <dt className="text-unmarked">Founded</dt>
              <dd className="text-chalk">{sport.founded ?? 'Not recorded'}</dd>
            </div>
            <div>
              <dt className="text-unmarked">Olympic status</dt>
              <dd className="text-chalk">
                {program ? (
                  <>
                    <span className="numeral">{program.held.length}</span> editions
                    {program.held.includes(2028) ? ', on the 2028 programme' : ', not on the 2028 programme'}
                  </>
                ) : (
                  'Not on the Olympic programme'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-unmarked">Rule changes recorded</dt>
              <dd className="numeral text-chalk">{rules.length}</dd>
            </div>
          </dl>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
            {lenses.map((lens) => {
              const group = lens.groups.find((g) => g.members.includes(sport.id))
              return (
                <div key={lens.id} className="flex items-baseline gap-2">
                  <dt className="text-unmarked">{lens.label}:</dt>
                  <dd className="text-chalk/85">{group?.label ?? 'unclassified'}</dd>
                </div>
              )
            })}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5">
        {sport.summary && (
          <p className="prose-measure mt-12 border-l-2 pl-5 text-[17px] text-chalk/85" style={{ borderColor: tint }}>
            {sport.summary}
          </p>
        )}

        {/* 2. Origin and invention. */}
        {sections
          .filter((s) => s.slug === 'origin')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug}>
              <Prose source={s.body} />
            </Section>
          ))}

        {/* 3. Rule timeline — the sport's own lane, expanded. */}
        <Section title="Rule timeline" id="rules">
          <p className="prose-measure mb-6 text-[16px] text-unmarked">
            The sport&rsquo;s own lane, expanded. Every entry carries a cause
            from the closed vocabulary and a citation, and says so where the
            citation is incomplete.
          </p>
          <RuleList rules={rules} causes={getCauses()} sources={getSourceMap()} series={series} />
        </Section>

        {/* 4. Equipment evolution, tied to the rules that forced it. */}
        {sections
          .filter((s) => s.slug === 'equipment')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug}>
              <Prose source={s.body} />
            </Section>
          ))}

        {/* 5. Governing body politics and schisms. */}
        {sections
          .filter((s) => s.slug === 'politics')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug}>
              <Prose source={s.body} />
            </Section>
          ))}

        {/* 6. Controversies that forced rule changes. */}
        {sections
          .filter((s) => s.slug === 'controversies')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug}>
              <Prose source={s.body} />
            </Section>
          ))}

        {/* 7. Series charts, with breaks rendered as breaks. */}
        <Section title="Series" id="series">
          {series.length === 0 ? (
            <p className="prose-measure text-[16px] text-unmarked">
              No series has been assembled for this sport.
            </p>
          ) : (
            series.map((s) => (
              <div key={s.id} id={s.id}>
                <SeriesChart series={s} colour={sport.family_colour} />
              </div>
            ))
          )}
        </Section>

        <nav className="mb-20 mt-16 border-t chalk-rule pt-6 text-[15px]">
          <Link href="/" className="text-chalk underline underline-offset-4">
            Back to the cross-sport timeline
          </Link>
        </nav>
      </div>
    </article>
  )
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-8">
      <h2 className="mb-5 font-display text-4xl text-chalk">{title}</h2>
      {children}
    </section>
  )
}
