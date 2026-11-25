import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { siteSchema } from '@/lib/seo'
import BreakDiagram from '@/components/BreakDiagram'
import SportCover from '@/components/SportCover'
import { Counter, Reveal } from '@/components/Motion'
import { fieldSvg } from '@/lib/fieldSvg'
import {
  getAllRuleChanges, getCover, getField, getGlossary, getLenses, getPlay, getSports,
} from '@/lib/content'

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

/**
 * A way in for a reader who knows few of these games: some that are watched
 * everywhere, and some that are not, from different families. Chosen by hand
 * because "most popular" is not something the site measures. A sport without
 * a cover photograph is skipped rather than shown as an empty panel.
 */
const START_WITH = [
  'football', 'badminton', 'cricket', 'judo',
  'volleyball', 'kabaddi', 'fencing', 'sepak-takraw', 'archery',
]

/** The court on the front page: drawn from its field.yaml, like every sport's. */
const FRONT_FIELD = 'tennis'

/** The game-category lens is the index by kind of game. Its catch-all group
    is named for what it holds on this page, not for the taxonomy it escapes. */
const INDEX_LENS = 'game-category'
const GROUP_TITLE: Record<string, string> = {
  'outside-taxonomy': 'Combat, judged and other contests',
}

export default function Home() {
  const sports = getSports()
  const rules = getAllRuleChanges()
  const byId = Object.fromEntries(sports.map((s) => [s.id, s]))

  const fields = sports.filter((s) => getField(s.id) !== null || s.id === 'badminton').length
  const terms = sports.reduce((n, s) => n + (getGlossary(s.id)?.terms.length ?? 0), 0)
  const walkthroughs = sports.filter((s) => getPlay(s.id)?.walkthrough).length

  const start = START_WITH.map((id) => byId[id])
    .filter(Boolean)
    .map((sport) => ({ sport, cover: getCover(sport) }))
    .filter((x): x is typeof x & { cover: NonNullable<typeof x.cover> } => x.cover !== null)
    .slice(0, 8)

  const field = getField(FRONT_FIELD)
  const fieldSport = byId[FRONT_FIELD]
  const fieldColour = COLOUR[fieldSport?.family_colour ?? 'unmarked'] ?? COLOUR.unmarked

  const lens = getLenses().find((l) => l.id === INDEX_LENS)
  const groups = (lens?.groups ?? [])
    .map((g) => ({
      id: g.id,
      title: GROUP_TITLE[g.id] ?? g.label,
      colour: COLOUR[g.colour] ?? COLOUR.unmarked,
      members: g.members
        .filter((id) => byId[id])
        .sort((a, b) => byId[a].label.localeCompare(byId[b].label)),
    }))
    .filter((g) => g.members.length > 0)
  /* A sport the lens does not list still belongs in the index. */
  const listed = new Set(groups.flatMap((g) => g.members))
  const unlisted = sports.filter((s) => !listed.has(s.id)).map((s) => s.id)
  if (unlisted.length) {
    groups.push({ id: 'unlisted', title: 'Not yet grouped', colour: COLOUR.unmarked, members: unlisted })
  }

  return (
    <>
      <JsonLd data={siteSchema()} />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b chalk-rule">
        <div aria-hidden className="court-grid court-grid-fade absolute inset-0" />

        <div className="relative mx-auto max-w-[86rem] px-5 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center">
            <div>
              <Reveal>
                <p className="eyebrow">An encyclopedia of {sports.length} sports</p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="display-xl mt-5 max-w-[18ch] text-fluid-h1 text-chalk">
                  How every game is played, and why its rules are the way they are.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <div className="prose-measure mt-7 text-fluid-lead text-chalk/85">
                  <p>
                    Each sport is explained for someone who has never seen it:
                    one rally, bout or race from start to finish, the playing
                    area drawn to scale, the words players use, and the laws in
                    force. Behind every law is the rule change that made it,
                    with its date, its reason and its source.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/sports/"
                    className="group inline-flex items-center gap-3 bg-chalk px-6 py-3 font-display text-lg tracking-wide text-ink transition-colors hover:bg-gold-bright"
                  >
                    Browse the sports
                    <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/play/"
                    className="group inline-flex items-center gap-3 border border-chalk/30 px-6 py-3 font-display text-lg tracking-wide text-chalk transition-colors hover:border-chalk"
                  >
                    Compare the laws
                    <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* One court, drawn the way every sport's is. */}
            {field && fieldSport && (
              <Reveal delay={240}>
                <figure className="panel p-5 sm:p-6">
                  <div dangerouslySetInnerHTML={{ __html: fieldSvg(field, fieldColour.bright) }} />
                  <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[14px] text-dim">
                    <span>{field.title}, drawn to scale from the laws.</span>
                    <Link href={`/sports/${fieldSport.id}/#play`} className="link-paint text-chalk">
                      How {fieldSport.label.toLowerCase()} is played
                    </Link>
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </div>

          {/* --------------------------------------------------- stat strip */}
          <Reveal delay={300}>
            <dl className="mt-14 grid grid-cols-2 gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-4">
              <Stat n={walkthroughs} label="sports explained" sub="one rally or race, step by step" />
              <Stat n={fields} label="playing areas drawn" sub="from the measurements in the laws" />
              <Stat n={terms} label="terms defined" sub="each sport's own words" />
              <Stat n={rules.length} label="rule changes" sub="each with a date and a reason" />
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- start with */}
      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
            <div>
              <h2 className="text-fluid-h2 text-chalk">Start with a game</h2>
              <p className="prose-measure mt-4 text-fluid-base text-chalk/80">
                A few to begin with, some watched everywhere and some barely
                known outside the places that play them.
              </p>
            </div>
            <Link
              href="/sports/"
              className="group inline-flex items-center gap-3 border border-chalk/30 px-5 py-2.5 font-display text-lg text-chalk transition-colors hover:border-chalk"
            >
              All {sports.length} sports
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {start.map(({ sport: s, cover }, i) => {
            const c = COLOUR[s.family_colour] ?? COLOUR.unmarked
            return (
              <Reveal as="li" key={s.id} delay={i * 60}>
                <Link
                  href={`/sports/${s.id}/`}
                  className="group flex h-full flex-col border border-chalk/[0.12] transition-colors hover:border-[var(--bright)]"
                  style={{ ['--bright' as string]: c.bright }}
                >
                  <span className="relative block aspect-[16/10] overflow-hidden">
                    <SportCover
                      image={{ file: cover.file, alt: cover.alt, width: cover.width, height: cover.height, position: s.cover_position }}
                      colour={s.family_colour}
                      label={s.label}
                      className="!absolute inset-0"
                    />
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-4">
                    <span className="font-display text-[26px] leading-none text-chalk">{s.label}</span>
                    <span className="line-clamp-3 text-[14.5px] leading-snug text-chalk/75">{s.tagline}</span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </section>

      {/* ---------------------------------------------------- by kind */}
      <section className="border-y chalk-rule bg-surface/40">
        <div className="mx-auto max-w-[86rem] px-5 py-16 sm:py-20">
          <Reveal>
            <h2 className="text-fluid-h2 text-chalk">Every sport, by kind of game</h2>
            <p className="prose-measure mt-4 text-fluid-base text-chalk/80">
              Grouped by what the players are trying to do: get the ball past a
              net, invade the other side&rsquo;s ground, hit and run, hit a
              target, or perform for a clock, a tape or a panel.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g, i) => (
              <Reveal key={g.id} delay={i * 50}>
                <h3 className="flex items-baseline gap-3 border-t-2 pt-3 font-display text-2xl text-chalk" style={{ borderColor: g.colour.bright }}>
                  {g.title}
                  <span className="numeral text-[15px] text-unmarked">{g.members.length}</span>
                </h3>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[15.5px]">
                  {g.members.map((id) => (
                    <li key={id}>
                      <Link href={`/sports/${id}/`} className="link-paint text-chalk/85 hover:text-chalk">
                        {byId[id].label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- history */}
      <section className="mx-auto max-w-[86rem] px-5 py-16 sm:py-24">
        <div className="grid gap-x-14 gap-y-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
          <Reveal>
            <h2 className="text-fluid-h2 text-chalk">Why the rules are the way they are</h2>
            <div className="prose-measure mt-4 space-y-4 text-fluid-base text-chalk/80">
              <p>
                Every law was written by someone, for a reason, on a date.
                Badminton went to 21-point rally scoring in 2006 so that a match
                would fit a broadcast slot. The javelin was redesigned in 1986
                because throws were reaching the end of the stadium.
              </p>
              <p>
                The history lays all {rules.length} recorded changes on one time
                axis, so the patterns show: scoring rewritten for television,
                safety rules after injuries. Some changes cut a record book in
                two, and those breaks are drawn as breaks.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/history/"
                className="group inline-flex items-center gap-3 bg-chalk px-6 py-3 font-display text-lg tracking-wide text-ink transition-colors hover:bg-gold-bright"
              >
                Open the history
                <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/breaks/"
                className="group inline-flex items-center gap-3 border border-chalk/30 px-6 py-3 font-display text-lg tracking-wide text-chalk transition-colors hover:border-chalk"
              >
                Where the numbers stop
                <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <figure className="panel p-6">
              <BreakDiagram className="h-24" />
              <figcaption className="mt-3 text-[14px] text-dim">
                A comparability break. The line stops, steps, and resumes on a
                different baseline. Nothing is ever drawn across the gap.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- close */}
      <section className="border-t chalk-rule">
        <div className="mx-auto max-w-[86rem] px-5 py-14">
          <Reveal>
            <p className="prose-measure text-fluid-base text-chalk/75">
              Read-only and static. The laws are entered from the edition each
              governing body names, and a figure not yet checked against that
              text says so on the page.
            </p>
            <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <Link href="/sources/" className="link-paint text-chalk">
                How far each citation has been checked
              </Link>
              <Link href="/about/" className="link-paint text-chalk">
                How the facts are kept honest
              </Link>
            </p>
          </Reveal>
        </div>
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
