import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Prose from '@/components/Prose'
import SeriesChart from '@/components/SeriesChart'
import RuleList from '@/components/RuleList'
import MiniLane from '@/components/MiniLane'
import SectionNav from '@/components/SectionNav'
import Diagram from '@/components/Diagram'
import SourcedPhoto from '@/components/SourcedPhoto'
import JavelinCentreOfGravity from '@/components/diagrams/JavelinCentreOfGravity'
import ScoringSystems from '@/components/diagrams/ScoringSystems'
import ScoreScales from '@/components/diagrams/ScoreScales'
import { Reveal } from '@/components/Motion'
import CurrentLaws from '@/components/CurrentLaws'
import {
  getCauses, getImageForSport, getLenses, getPlay, getProgram, getRuleChanges,
  getSections, getSeriesForSport, getSourceMap, getSport, getSportIds,
} from '@/lib/content'

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

/**
 * Diagrams are drawn by this site rather than sourced, and each one explains
 * what a specific rule changed. They are keyed to the section that discusses
 * that rule, so a diagram never appears as decoration next to prose it has
 * nothing to do with.
 */
function diagramFor(sport: string, slot: string) {
  if (sport === 'athletics' && slot === 'equipment') {
    return (
      <Diagram
        eyebrow="What the 1986 rule changed"
        title="Four centimetres, and the record book"
        colour="pool"
        caption="Drawn to scale, which is the point: four centimetres on a 2.6 metre shaft is a shift you have to be told to look for, and it took roughly ten per cent off the world record. Moving the balance point towards the tip makes the nose drop earlier, so the implement lands point-first and closer — which is what World Athletics wanted, because flat landings were producing judging arguments and throws were reaching the end of the stadium. The flight paths are schematic; the implement is not."
      >
        <JavelinCentreOfGravity />
      </Diagram>
    )
  }
  if (sport === 'badminton' && slot === 'rules') {
    return (
      <Diagram
        eyebrow="What the 2006 rule changed"
        title="The same rallies, counted twice"
        colour="clay"
        caption="One invented run of sixteen rallies, scored under both systems. Under side-out scoring only the serving side could score, so a rally won by the receiver produced no number at all and left nothing behind in the record; from May 2006 every rally produces a point. Same play, different data — which is why no match statistic crosses that line. The rallies are illustrative, not taken from a match."
      >
        <ScoringSystems />
      </Diagram>
    )
  }
  if (sport === 'gymnastics' && slot === 'series') {
    return (
      <Diagram
        eyebrow="Why there is no chart here"
        title="Two scales, and no way between them"
        colour="gold"
        caption="The two rulers are drawn with different baselines and different spacings on purpose. Putting them on one axis would be the exact claim this page refuses: a 9.85 does not sit below a 15.633, it sits outside it. The left scale had a real ceiling, which is what made the perfect 10 legible to people who knew nothing else about the sport; the right one has no maximum to draw."
      >
        <ScoreScales />
      </Diagram>
    )
  }
  return null
}

/** Where each sport's photograph belongs: beside the thing it is evidence of. */
const PHOTO_SLOT: Record<string, string> = {
  athletics: 'series',
  badminton: 'controversies',
  gymnastics: 'controversies',
  swimming: 'equipment',
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

  const now = new Date().getFullYear()
  const sport = getSport(params.sport)
  const rules = getRuleChanges(params.sport)
  const series = getSeriesForSport(params.sport)
  const sections = getSections(params.sport)
  const play = getPlay(params.sport)
  const lenses = getLenses()
  const program = getProgram().sports.find((s) => s.id === params.sport)
  const c = COLOUR[sport.family_colour] ?? COLOUR.unmarked

  const ruleYears = rules.map((r) => Number(r.date_effective.slice(0, 4)))
  const breakYears = series.filter((s) => s.break).map((s) => s.break!.at)
  const span: [number, number] = [Math.min(...ruleYears) - 4, Math.max(...ruleYears) + 4]

  const photo = getImageForSport(params.sport)
  const photoSlot = PHOTO_SLOT[params.sport]
  const photoFor = (slot: string) =>
    photo && photoSlot === slot ? (
      <SourcedPhoto image={photo} colour={sport.family_colour} />
    ) : null

  const has = (slug: string) => sections.some((s) => s.slug === slug)
  const nav = [
    play && { id: 'play', label: 'How it is played' },
    has('origin') && { id: 'origin', label: 'Origin' },
    { id: 'rules', label: 'Rule timeline' },
    has('equipment') && { id: 'equipment', label: 'Equipment' },
    has('politics') && { id: 'politics', label: 'Politics' },
    has('controversies') && { id: 'controversies', label: 'Controversies' },
    { id: 'series', label: 'Series' },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <article>
      {/* 1. Identity, governing body, current status in the Olympic programme. */}
      <header className="relative overflow-hidden border-b chalk-rule">
        <div aria-hidden className="court-grid court-grid-fade absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(58rem 30rem at 6% -10%, ${c.base}55, transparent 70%)`,
          }}
        />
        <div className="relative mx-auto max-w-[86rem] px-5 pb-12 pt-12 sm:pb-16 sm:pt-16">
          <Reveal>
            <Link
              href="/sports/"
              className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-chalk"
            >
              <span aria-hidden>←</span> All sports
            </Link>
          </Reveal>

          <div className="mt-6 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
            <Reveal delay={60}>
              <span aria-hidden className="block h-1.5 w-24" style={{ background: c.bright }} />
              <h1 className="display-xl mt-5 text-fluid-h1 text-chalk">{sport.label}</h1>
              <p className="prose-measure mt-4 text-fluid-lead text-chalk/85">{sport.tagline}</p>
            </Reveal>

            {/* The sport's own lane, before it is expanded further down. */}
            <Reveal delay={140}>
              <figure className="panel p-5">
                <MiniLane
                  className="h-14 w-full"
                  years={ruleYears}
                  breaks={breakYears}
                  colour={sport.family_colour}
                  from={span[0]}
                  to={span[1]}
                />
                <figcaption className="mt-2 flex items-baseline justify-between text-[13px] text-unmarked">
                  <span className="numeral">{span[0] + 4}</span>
                  <span>
                    {rules.length} rule changes · {breakYears.length} break
                    {breakYears.length === 1 ? '' : 's'}
                  </span>
                  <span className="numeral">{span[1] - 4}</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <dl className="mt-12 grid gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-2 lg:grid-cols-4">
              <Fact term="Governing body" value={sport.governing_body} />
              <Fact term="Founded" value={sport.founded ?? 'Not recorded'} />
              <Fact
                term="Olympic status"
                value={
                  program
                    ? `${program.held.length} editions${
                        program.held.includes(2028)
                          ? ', on the 2028 programme'
                          : ', not on the 2028 programme'
                      }`
                    : 'Not on the Olympic programme'
                }
              />
              <Fact term="Rule changes recorded" value={String(rules.length)} numeral />
            </dl>
          </Reveal>

          <Reveal delay={240}>
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
          </Reveal>
        </div>
      </header>

      <SectionNav items={nav} />

      <div className="mx-auto max-w-[86rem] px-5">
        {sport.summary && (
          <Reveal>
            <p
              className="prose-measure mt-14 border-l-2 pl-6 text-fluid-lead text-chalk/85"
              style={{ borderColor: c.bright }}
            >
              {sport.summary}
            </p>
          </Reveal>
        )}

        {/* 2. How it is played — the laws as they now stand. This comes before
            the history on purpose: the current law is what the changes
            produced, so the page reads forwards from the answer. */}
        {play && (
          <Section title="How it is played" id="play" n={1} colour={c.bright}>
            <CurrentLaws
              play={play}
              rules={rules}
              source={getSourceMap()[play.source]}
              colour={c}
              sportLabel={sport.label}
            />
          </Section>
        )}

        {/* 3. Origin and invention. */}
        {sections
          .filter((s) => s.slug === 'origin')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug} n={2} colour={c.bright} reading tint={c.base}>
              <Prose source={s.body} />
            </Section>
          ))}

        {/* 3. Rule timeline — the sport's own lane, expanded. */}
        <Section title="Rule timeline" id="rules" n={3} colour={c.bright}>
          <p className="prose-measure mb-8 text-fluid-base text-unmarked">
            The sport&rsquo;s own lane, expanded. Every entry carries a cause
            from the closed vocabulary and a citation, and says so where the
            citation is incomplete.
          </p>
          <RuleList rules={rules} causes={getCauses()} sources={getSourceMap()} series={series} />
          {diagramFor(params.sport, 'rules')}
        </Section>

        {/* 4. Equipment evolution, tied to the rules that forced it. */}
        {sections
          .filter((s) => s.slug === 'equipment')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug} n={4} colour={c.bright} reading tint={c.base}>
              <Prose source={s.body} />
              {diagramFor(params.sport, 'equipment')}
              {photoFor('equipment')}
            </Section>
          ))}

        {/* 5. Governing body politics and schisms. */}
        {sections
          .filter((s) => s.slug === 'politics')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug} n={5} colour={c.bright} reading tint={c.base}>
              <Prose source={s.body} />
            </Section>
          ))}

        {/* 6. Controversies that forced rule changes. */}
        {sections
          .filter((s) => s.slug === 'controversies')
          .map((s) => (
            <Section key={s.slug} title={s.title} id={s.slug} n={6} colour={c.bright} reading tint={c.base}>
              <Prose source={s.body} />
              {photoFor('controversies')}
            </Section>
          ))}

        {/* 7. Series charts, with breaks rendered as breaks. */}
        <Section title="Series" id="series" n={7} colour={c.bright}>
          {series.length === 0 ? (
            <p className="prose-measure text-fluid-base text-unmarked">
              No series has been assembled for this sport.
            </p>
          ) : (
            series.map((s) => (
              <div key={s.id} id={s.id} className="scroll-anchor">
                <SeriesChart series={s} colour={sport.family_colour} now={now} />
              </div>
            ))
          )}
          {diagramFor(params.sport, 'series')}
          {photoFor('series')}
        </Section>

        <nav className="mb-20 mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t chalk-rule pt-8 text-[15px]">
          <Link href="/" className="link-paint text-chalk">
            Back to the cross-sport timeline
          </Link>
          <Link href="/breaks/" className="link-paint text-chalk/75 hover:text-chalk">
            Every comparability break
          </Link>
          <Link href="/sources/" className="link-paint text-chalk/75 hover:text-chalk">
            How far each citation has been checked
          </Link>
        </nav>
      </div>
    </article>
  )
}

function Fact({ term, value, numeral }: { term: string; value: string; numeral?: boolean }) {
  return (
    <div className="bg-ink px-5 py-4">
      <dt className="text-[13px] text-unmarked">{term}</dt>
      <dd className={`mt-1 text-[15px] text-chalk ${numeral ? 'numeral text-[22px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function Section({
  title, id, n, colour, children, reading, tint,
}: {
  title: string
  id: string
  n: number
  colour: string
  children: React.ReactNode
  /** Narrative sections read on a tint of the family colour (DESIGN.md), so
      reading mode is recognisable without being labelled. */
  reading?: boolean
  tint?: string
}) {
  return (
    <section id={id} className="mt-20 scroll-anchor">
      <Reveal>
        <h2 className="mb-8 flex items-baseline gap-5 font-display text-fluid-h2 text-chalk">
          <span className="numeral text-[18px]" style={{ color: colour }}>
            {String(n).padStart(2, '0')}
          </span>
          {title}
          <span aria-hidden className="h-px flex-1 bg-chalk/[0.12]" />
        </h2>
      </Reveal>
      <Reveal delay={80}>
        {reading ? (
          <div
            className="border-l-2 py-9 pl-6 pr-5 sm:pl-12"
            style={{
              borderColor: colour,
              background: `linear-gradient(100deg, ${tint}26, ${tint}08 55%, transparent 88%)`,
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </Reveal>
    </section>
  )
}
