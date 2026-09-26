import Link from 'next/link'
import Emphasis from '@/components/Emphasis'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Prose from '@/components/Prose'
import SeriesChart from '@/components/SeriesChart'
import RuleList from '@/components/RuleList'
import MiniLane from '@/components/MiniLane'
import SectionNav, { SectionRail, type NavItem } from '@/components/SectionNav'
import SportCover from '@/components/SportCover'
import { BREAK_KIND_LABEL } from '@/lib/series'
import Diagram from '@/components/Diagram'
import PhotoSet from '@/components/PhotoSet'
import SportIcon from '@/components/SportIcon'
import JavelinCentreOfGravity from '@/components/diagrams/JavelinCentreOfGravity'
import ScoringSystems from '@/components/diagrams/ScoringSystems'
import ScoreScales from '@/components/diagrams/ScoreScales'
import { Reveal } from '@/components/Motion'
import CurrentLaws from '@/components/CurrentLaws'
import LearningCurve from '@/components/LearningCurve'
import EventTree from '@/components/EventTree'
import {
  getCauses, getCover, getEvents, getImagesForSport, getLearning, getLenses, getPlay,
  getProgram, getProgrammes, getRuleChanges, getSections, getSeriesForSport, getSourceMap,
  getSport, getSportIds, getSports,
} from '@/lib/content'

/** Each family's paper tint, for reading panels. */
const PAPER: Record<string, string> = {
  pool: '#E7EEF3',
  pitch: '#E6EFE8',
  clay: '#F3E8E1',
  gold: '#F3EEDD',
  unmarked: '#ECEFEE',
}

/** The family colour dark enough to be read on its own paper (≥4.3:1). Gold's
    base is 2.2:1 on gold paper, so it gets a deeper ochre. */
const ON_PAPER: Record<string, string> = {
  pool: '#1D6FA8',
  pitch: '#2F7D4F',
  clay: '#B7502A',
  gold: '#85650E',
  unmarked: '#4E6366',
}

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
  const learning = getLearning(params.sport)
  const events = getEvents(params.sport)
  const lenses = getLenses()
  const program = getProgram().sports.find((s) => s.id === params.sport)
  /* The other programmes that list this sport. A sport's standing used to be
     a single Olympic fact, which said nothing about the squash contested at
     the World Games for decades while the Games kept turning it down. */
  const alsoOn = getProgrammes()
    .filter((p) => p.id !== 'olympic' && p.sports.some((s) => s.id === params.sport))
    .map((p) => p.short)
  const c = COLOUR[sport.family_colour] ?? COLOUR.unmarked
  const cover = getCover(sport)

  const ruleYears = rules.map((r) => Number(r.date_effective.slice(0, 4)))
  const breakYears = series.flatMap((s) => s.breaks.map((b) => b.at))
  const span: [number, number] = [Math.min(...ruleYears) - 4, Math.max(...ruleYears) + 4]

  /* Photographs sit beside the thing they are evidence of: either inline in
     a narrative section's MDX, by id, or at the end of the section named by
     their `slot`. */
  const photos = getImagesForSport(params.sport)
  const photosById = Object.fromEntries(photos.map((p) => [p.id, p]))
  const photoFor = (slot: string) => (
    <PhotoSet images={photos.filter((p) => p.slot === slot)} colour={sport.family_colour} />
  )

  const has = (slug: string) => sections.some((s) => s.slug === slug)
  const prose = (slug: string) => {
    const found = sections.find((s) => s.slug === slug)
    return found ? { id: slug, label: found.title, body: found.body } : null
  }
  /** A narrative section: its MDX and the photographs keyed to it, which
      sit on the paper panel together. A diagram keyed to it is drawn after
      the panel, on the court — its line-work is chalk. */
  const reading = (slug: string) => (
    <>
      <Prose source={prose(slug)!.body} images={photosById} colour={sport.family_colour} />
      {photoFor(slug)}
    </>
  )

  /**
   * Every section the page can show, in order, grouped into three acts. Built
   * as data so that adding a section is one entry rather than a hand-renumbered
   * edit in four places — which is how the numbering drifted last time.
   */
  const plan: {
    act: string
    blurb: string
    items: ({ id: string; label: string; node: React.ReactNode; reading?: boolean } | null)[]
  }[] = [
    {
      act: 'The game',
      blurb: 'what it is now',
      items: [
        play && {
          id: 'play',
          label: 'How it is played',
          node: (
            <>
              <CurrentLaws
                play={play}
                rules={rules}
                source={getSourceMap()[play.source]}
                colour={c}
                sportLabel={sport.label}
                figures={(clause) => photoFor(`play:${clause}`)}
              />
              {photoFor('play')}
            </>
          ),
        },
        events && {
          id: 'events',
          label: 'Disciplines and events',
          node: (
            <>
              <EventTree events={events} colour={c} />
              {photoFor('events')}
            </>
          ),
        },
        prose('officiating') && {
          id: 'officiating',
          label: prose('officiating')!.label,
          reading: true,
          node: reading('officiating'),
        },
        prose('geography') && {
          id: 'geography',
          label: prose('geography')!.label,
          reading: true,
          node: reading('geography'),
        },
        learning && {
          id: 'learning',
          label: 'Learning curve',
          node: <LearningCurve learning={learning} rules={rules} colour={c} />,
        },
      ],
    },
    {
      act: 'The history',
      blurb: 'how it got here',
      items: [
        prose('origin') && {
          id: 'origin',
          label: prose('origin')!.label,
          reading: true,
          node: reading('origin'),
        },
        {
          id: 'rules',
          label: 'Rule timeline',
          node: (
            <>
              <p className="prose-measure mb-8 text-fluid-base text-unmarked">
                The sport&rsquo;s own lane, expanded. Every entry carries a cause
                from the closed vocabulary and a citation, and says so where the
                citation is incomplete.
              </p>
              <RuleList rules={rules} causes={getCauses()} sources={getSourceMap()} series={series} colour={sport.family_colour} />
              {diagramFor(params.sport, 'rules')}
            </>
          ),
        },
        prose('equipment') && {
          id: 'equipment',
          label: prose('equipment')!.label,
          reading: true,
          node: reading('equipment'),
        },
        prose('politics') && {
          id: 'politics',
          label: prose('politics')!.label,
          reading: true,
          node: reading('politics'),
        },
        prose('controversies') && {
          id: 'controversies',
          label: prose('controversies')!.label,
          reading: true,
          node: reading('controversies'),
        },
      ],
    },
    {
      act: 'Where it stands',
      blurb: 'the record, and what is still open',
      items: [
        {
          id: 'series',
          label: 'Series',
          node:
            series.length === 0 ? (
              <>
                <p className="prose-measure text-fluid-base text-unmarked">
                  No series has been assembled for this sport.
                </p>
                {photoFor('series')}
              </>
            ) : (
              <>
                {series.map((s) => (
                  <div key={s.id} id={s.id} className="scroll-anchor">
                    <SeriesChart series={s} colour={sport.family_colour} now={now} />
                  </div>
                ))}
                {diagramFor(params.sport, 'series')}
                {photoFor('series')}
              </>
            ),
        },
        prose('contested') && {
          id: 'contested',
          label: prose('contested')!.label,
          reading: true,
          node: reading('contested'),
        },
      ],
    },
  ]

  let n = 0
  const acts = plan
    .map((group) => ({
      title: group.act,
      blurb: group.blurb,
      sections: group.items
        .filter((i): i is NonNullable<typeof i> => Boolean(i))
        .map((i) => ({ ...i, n: ++n })),
    }))
    .filter((group) => group.sections.length > 0)

  /* The nav strip is one line that scrolls; a section title that reads well as
     a heading — "Controversies that forced rule changes" — is too long for it. */
  const NAV_SHORT: Record<string, string> = {
    play: 'The laws',
    geography: 'Geography',
    learning: 'Learning',
    rules: 'Rule timeline',
    contested: 'Contested',
    origin: 'Origin',
    equipment: 'Equipment',
    politics: 'Politics',
    controversies: 'Controversies',
    officiating: 'Officiating',
    events: 'Events',
  }
  const nav: NavItem[] = acts.flatMap((group) =>
    group.sections.map((item) => ({
      id: item.id,
      n: item.n,
      act: group.title,
      label: NAV_SHORT[item.id] ?? item.label,
    })),
  )

  /* The sport's breaks, once each, for the rail: a rule that severed two
     series is one break in the sport's history. */
  const breaks = [
    ...new Map(
      series.flatMap((s) => s.breaks.map((b) => ({ ...b, series: s.id }))).map((b) => [b.at, b]),
    ).values(),
  ].sort((a, b) => a.at - b.at)

  /* Neighbours in the index's A to Z, so a page ends somewhere to go. */
  const all = getSports().sort((a, b) => a.label.localeCompare(b.label))
  const at = all.findIndex((s) => s.id === sport.id)
  const prev = at > 0 ? all[at - 1] : null
  const next = at < all.length - 1 ? all[at + 1] : null

  const editions = program?.held.length ?? 0

  return (
    <article>
      {/* 1. Identity: the cover, the name, and the sport at a glance. */}
      <header className="relative isolate overflow-hidden border-b chalk-rule">
        {cover ? (
          <>
            <SportCover
              image={{ file: cover.file, alt: cover.alt, width: cover.width, height: cover.height, position: sport.cover_position }}
              colour={sport.family_colour}
              label={sport.label}
              eager
              className="!absolute inset-0 -z-20"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(90deg, rgb(4 19 23 / 0.94) 0%, rgb(4 19 23 / 0.72) 45%, rgb(4 19 23 / 0.18) 80%), linear-gradient(0deg, #041317 0%, transparent 50%)',
              }}
            />
          </>
        ) : (
          <>
            <div aria-hidden className="court-grid court-grid-fade absolute inset-0 -z-10" />
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: `radial-gradient(58rem 30rem at 6% -10%, ${c.base}55, transparent 70%)` }}
            />
          </>
        )}

        <div
          className={`relative mx-auto flex max-w-[86rem] flex-col justify-end px-5 pb-10 pt-10 sm:pb-14 ${
            cover ? 'min-h-[30rem] sm:min-h-[36rem]' : 'sm:pt-14'
          }`}
        >
          <Reveal>
            <Link
              href="/sports/"
              className="inline-flex items-center gap-2 text-[14px] text-dim transition-colors hover:text-chalk"
            >
              <span aria-hidden>←</span> All sports
            </Link>
          </Reveal>

          <div className="mt-6 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:items-end">
            <Reveal delay={60}>
              <div className="flex items-center gap-4 sm:gap-6">
                <SportIcon
                  sport={sport.id}
                  colour={sport.family_colour}
                  className="h-14 w-14 sm:h-[5.5rem] sm:w-[5.5rem]"
                />
                <h1 className="display-xl min-w-0 text-fluid-mega text-chalk">{sport.label}</h1>
              </div>
              <p className="mt-5 max-w-[42ch] text-fluid-lead text-chalk/90">{sport.tagline}</p>
              <dl className="mt-6 flex flex-wrap gap-2 text-[13px]">
                {lenses.map((lens) => {
                  const group = lens.groups.find((g) => g.members.includes(sport.id))
                  return (
                    <div
                      key={lens.id}
                      className="flex items-baseline gap-1.5 rounded-full border border-chalk/25 bg-ink/50 px-3 py-1 backdrop-blur"
                    >
                      <dt className="text-dim">{lens.label}</dt>
                      <dd className="text-chalk">{group?.label ?? 'unclassified'}</dd>
                    </div>
                  )
                })}
              </dl>
            </Reveal>

            {/* The sport at a glance, and its own lane before it is expanded
                further down. */}
            <Reveal delay={140}>
              <figure className="border border-chalk/20 bg-surface/75 p-5 backdrop-blur-xl">
                <dl className="grid grid-cols-3 gap-3">
                  <Glance value={rules.length} label={rules.length === 1 ? 'rule change' : 'rule changes'} />
                  <Glance
                    value={breaks.length}
                    label={breaks.length === 1 ? 'comparability break' : 'comparability breaks'}
                    colour={c.bright}
                  />
                  <Glance value={editions} label={editions === 1 ? 'Olympic edition' : 'Olympic editions'} />
                </dl>
                <div className="mt-4 border-t chalk-rule pt-3">
                  <MiniLane
                    className="h-12 w-full"
                    years={ruleYears}
                    breaks={breakYears}
                    colour={sport.family_colour}
                    from={span[0]}
                    to={span[1]}
                  />
                  <figcaption className="mt-1 flex items-baseline justify-between text-[12.5px] text-unmarked">
                    <span className="numeral">{span[0] + 4}</span>
                    <span>{rules.length} rule changes on the sport&rsquo;s own lane</span>
                    <span className="numeral">{span[1] - 4}</span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          </div>

          {cover && (
            <p className="mt-8 self-end bg-ink/60 px-2.5 py-1 text-right text-[12px] text-chalk/70 backdrop-blur lg:absolute lg:right-5 lg:top-5 lg:mt-0">
              {cover.alt.replace(/\.$/, '')} · {cover.author} ·{' '}
              <a href={cover.source_url} className="link-paint" target="_blank" rel="noopener noreferrer">
                {cover.licence}
              </a>
            </p>
          )}
        </div>
      </header>

      {/* 2. Governing body and standing. Founded is prose, so it gets the room
          for it rather than a year pulled out of it. */}
      <Reveal className="border-b chalk-rule">
        <dl className="mx-auto grid max-w-[86rem] gap-px bg-chalk/[0.08] sm:grid-cols-2 lg:grid-cols-5 min-[1376px]:border-x min-[1376px]:chalk-rule">
          <Fact term="Governing body" value={sport.governing_body} />
          <Fact term="Founded" value={sport.founded ?? 'Not recorded'} wide />
          <Fact
            term="Olympic status"
            value={
              program
                ? program.held.includes(2028)
                  ? 'on the 2028 programme'
                  : 'not on the 2028 programme'
                : 'Not on the Olympic programme'
            }
            figure={program ? `${editions} edition${editions === 1 ? '' : 's'}` : undefined}
          />
          <Fact
            term="Also contested at"
            value={alsoOn.length ? alsoOn.join(', ') : 'No other programme here'}
          />
        </dl>
      </Reveal>

      <SectionNav items={nav} colour={c.bright} />

      <div className="mx-auto max-w-[86rem] px-5 xl:grid xl:grid-cols-[minmax(0,1fr)_16.5rem] xl:gap-14">
        <div className="min-w-0">
          {sport.summary && (
            <Reveal>
              <p
                className="prose-measure mt-14 border-l-2 pl-6 text-fluid-lead text-chalk/85"
                style={{ borderColor: c.bright }}
              >
                <Emphasis>{sport.summary}</Emphasis>
              </p>
            </Reveal>
          )}

          {/*
            Three acts: what the sport IS, how it GOT here, and what that did
            to its numbers. Numbering runs unbroken across the acts so a
            section keeps one identity in the nav and in a deep link.
          */}
          {acts.map((act) => (
            <div key={act.title}>
              <Reveal>
                <h2 className="mt-24 border-t-2 pt-6" style={{ borderColor: `${c.bright}66` }}>
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-display text-[40px] font-bold leading-none sm:text-[48px]" style={{ color: c.bright }}>
                      {act.title}
                    </span>
                    <span className="font-body text-[16px] font-normal text-dim [font-stretch:normal]">
                      {act.blurb} · sections {act.sections[0].n}
                      {act.sections.length > 1 ? ` to ${act.sections[act.sections.length - 1].n}` : ''}
                    </span>
                  </span>
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {act.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex items-baseline gap-2 border border-chalk/20 px-3 py-1.5 text-[13.5px] text-dim transition-colors hover:border-chalk/50 hover:text-chalk"
                      >
                        <span className="numeral text-[14px]" style={{ color: c.bright }}>
                          {String(s.n).padStart(2, '0')}
                        </span>
                        {NAV_SHORT[s.id] ?? s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
              {act.sections.map((item) => (
                <Section
                  key={item.id}
                  title={item.label}
                  id={item.id}
                  n={item.n}
                  colour={c.bright}
                  reading={item.reading}
                  tint={item.reading ? c.base : undefined}
                  paper={item.reading ? PAPER[sport.family_colour] ?? PAPER.unmarked : undefined}
                  ink={item.reading ? ON_PAPER[sport.family_colour] ?? ON_PAPER.unmarked : undefined}
                  after={item.reading ? diagramFor(params.sport, item.id) : undefined}
                >
                  {item.node}
                </Section>
              ))}
            </div>
          ))}
        </div>

        <aside className="hidden xl:block" aria-label="On this page">
          <div className="h-full pt-14">
            <SectionRail items={nav} colour={c.bright}>
              {breaks.map((b) => (
                <a
                  key={b.at}
                  href={`#${b.series}`}
                  className="block border p-4 transition-colors hover:bg-chalk/[0.03]"
                  style={{
                    borderColor: `${c.bright}66`,
                    background: `linear-gradient(180deg, ${c.base}2e, transparent)`,
                  }}
                >
                  <MiniLane
                    className="mb-2 h-7 w-full"
                    years={[b.at]}
                    breaks={[b.at]}
                    colour={sport.family_colour}
                    from={b.at - 20}
                    to={b.at + 20}
                  />
                  <span className="numeral text-[30px] leading-none text-chalk">{b.at}</span>{' '}
                  <span className="text-[13px] text-unmarked">{BREAK_KIND_LABEL[b.kind]}</span>
                  <span className="mt-1.5 line-clamp-4 text-[13.5px] leading-snug text-dim">
                    {b.note.replace(/\s+/g, ' ')}
                  </span>
                </a>
              ))}
            </SectionRail>
          </div>
        </aside>
      </div>

      <nav aria-label="Neighbouring sports" className="mt-24 border-y chalk-rule">
        <div className="mx-auto grid max-w-[86rem] sm:grid-cols-2">
        {[prev, next].map((s, i) =>
          s ? (
            <Link
              key={s.id}
              href={`/sports/${s.id}/`}
              className={`group relative flex flex-col gap-1 px-5 py-7 transition-colors hover:bg-surface ${
                i === 1 ? 'sm:items-end sm:border-l sm:text-right chalk-rule' : ''
              } ${i === 1 && !prev ? 'sm:col-start-2' : ''}`}
            >
              <span className="text-[13px] text-unmarked">
                {i === 0 ? '← Previous' : 'Next →'}
              </span>
              <span className="font-display text-[34px] leading-none text-chalk sm:text-[44px]">{s.label}</span>
              <span
                aria-hidden
                className={`absolute bottom-0 h-[3px] w-0 transition-all duration-500 ease-paint group-hover:w-full ${i === 1 ? 'right-0' : 'left-0'}`}
                style={{ background: (COLOUR[s.family_colour] ?? COLOUR.unmarked).bright }}
              />
            </Link>
          ) : null,
        )}
        </div>
      </nav>

      <div className="mx-auto max-w-[86rem] px-5">
        <nav className="mb-20 mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px]">
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

function Glance({ value, label, colour }: { value: number; label: string; colour?: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-1.5 text-[12.5px] leading-tight text-dim">{label}</dt>
      <dd className="numeral text-[44px] font-bold leading-[0.9]" style={{ color: colour }}>
        {value}
      </dd>
    </div>
  )
}

function Fact({
  term, value, figure, wide,
}: {
  term: string
  value: string
  /** A short figure set large above the value, where there is one. */
  figure?: string
  wide?: boolean
}) {
  return (
    <div className={`bg-ink px-5 py-4 ${wide ? 'lg:col-span-2' : ''}`}>
      <dt className="text-[13px] text-unmarked">{term}</dt>
      {figure && <dd className="numeral mt-1 text-[26px] leading-none text-chalk">{figure}</dd>}
      <dd className={`text-[15px] leading-snug text-chalk/90 ${figure ? 'mt-1' : 'mt-1.5'}`}>{value}</dd>
    </div>
  )
}

function Section({
  title, id, n, colour, children, reading, tint, paper, ink, after,
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
  paper?: string
  /** The family colour as it reads on its paper: the drop capital. */
  ink?: string
  /** Drawn after a reading panel, off the paper: a diagram. */
  after?: React.ReactNode
}) {
  return (
    <section id={id} className="mt-20 scroll-anchor">
      <Reveal>
        {/* h3, not h2: these sit under the act heading that opens their
            group, and a flat run of h2s hid the grouping from a screen reader
            exactly as the missing divider hid it from the eye. */}
        <h3 className="mb-8 flex items-baseline gap-5 font-display text-fluid-h2 text-chalk">
          <span className="numeral text-[18px]" style={{ color: colour }}>
            {String(n).padStart(2, '0')}
          </span>
          {title}
          <span aria-hidden className="h-px flex-1 bg-chalk/[0.12]" />
        </h3>
      </Reveal>
      <Reveal delay={80}>
        {reading ? (
          /* Paper: the reading ground (DESIGN.md). Everything inside re-maps
             its text colours to ink through `.paper`, and the prose is set in
             the serif. */
          <div
            className="paper reading-panel border-l-4 px-6 py-9 sm:px-12 sm:py-12"
            style={{
              borderColor: tint,
              ['--paper' as string]: paper,
              ['--tint' as string]: tint,
              ['--drop' as string]: ink,
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </Reveal>
      {after}
    </section>
  )
}
