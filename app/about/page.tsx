import Link from 'next/link'
import type { Metadata } from 'next'
import { MarkGlyph } from '@/components/Mark'
import { Reveal } from '@/components/Motion'
import {
  getAllPlay, getAllRuleChanges, getAllSeries, getCauses, getLenses, getSports,
} from '@/lib/content'

export const metadata: Metadata = {
  title: 'About',
  description: 'What this site treats as a fact, what it refuses to draw, and where it is incomplete.',
}

const REFUSALS = [
  {
    title: 'Draw a line across a break',
    body:
      'Segments are separate paths on separate scales with a visible gap, and each prints its own axis. No interpolation, no trend line, no shared baseline. This is the whole point of the feature and it is enforced in the data layer, not by convention.',
  },
  {
    title: 'Invent a citation',
    body:
      'Every rule change needs a real edition and article. Where the article has not been confirmed against the text, the entry renders as incomplete rather than being quietly finished.',
  },
  {
    title: 'Infer a cause',
    body:
      'A cause comes from a stated reason or a sourced account. Where sources disagree the cause is disputed and both readings are kept, because a governing body’s stated reason and the widely-believed reason are often different and the gap is the interesting part.',
  },
  {
    title: 'Pass a scoped series off as the sport’s',
    body:
      'Football’s goals per game is labelled with its competition in the chart title itself, not in a footnote.',
  },
  {
    title: 'Let the skeleton layer borrow the deep layer’s authority',
    body:
      'Sports with no rule research show status and classification only and are marked as not yet covered wherever they appear.',
  },
]

export default function AboutPage() {
  const causes = getCauses()
  const lenses = getLenses()
  const rules = getAllRuleChanges()
  const series = getAllSeries()
  const sports = getSports()
  const play = getAllPlay()

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-12 sm:py-16">
      <Reveal>
        <p className="eyebrow">Method</p>
        <h1 className="display-xl mt-4 max-w-[16ch] text-fluid-h1 text-chalk">About</h1>
        <div className="prose-measure mt-5 space-y-4 text-fluid-lead text-chalk/85">
          <p>
            This site treats a rule change as a first-class object with a cause,
            a date, a citation, and a measurable consequence. The consequence is
            often that a number series stops being continuous, and that is the
            part nobody records systematically.
          </p>
          <p className="text-fluid-base">
            It also says what the rules are now. Each covered sport has its{' '}
            <Link href="/play/" className="link-paint text-chalk">
              laws in force
            </Link>{' '}
            written out against nine questions asked in the same order of every
            sport — and each clause links to the recorded changes that produced
            it, so the current law reads as the output of the timeline rather
            than as facts that were always true.
          </p>
          <p className="text-fluid-base">
            Read-only, static, and built for its author to read. There is no
            ranking of sports against each other, no live data, and no estimated
            numbers anywhere.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="mt-20">
        <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
          What it refuses to do
          <span aria-hidden className="h-px flex-1 bg-chalk/15" />
        </h2>
        <ol className="mt-8 grid gap-px border chalk-rule bg-chalk/[0.08] md:grid-cols-2 xl:grid-cols-3">
          {REFUSALS.map((r, i) => (
            <li key={r.title} className="flex flex-col bg-ink p-6">
              <span className="numeral text-[14px] text-unmarked">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1.5 font-display text-[23px] leading-tight text-chalk">
                {r.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-chalk/75">{r.body}</p>
            </li>
          ))}
          {/* The grid would otherwise end on an empty cell that reads as a
              missing sixth refusal. */}
          <li className="flex flex-col justify-end bg-ink p-6">
            <p className="text-[15px] leading-relaxed text-unmarked">
              Each of these is enforced where the data is shaped, not where it is
              drawn, so a future chart cannot opt out of one by accident.
            </p>
          </li>
        </ol>
      </Reveal>

      <Reveal as="section" className="mt-20">
        <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
          The cause vocabulary
          <span className="numeral text-[18px] text-unmarked">{causes.length}</span>
          <span aria-hidden className="h-px flex-1 bg-chalk/15" />
        </h2>
        <p className="prose-measure mt-4 text-fluid-base text-unmarked">
          Closed, and carried by shape rather than colour — colour is already
          carrying sport family, and eleven hues on one screen destroyed that
          reading. Shape also survives greyscale and colour-blind viewing.
        </p>
        <dl className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {causes.map((c, i) => (
            <div
              key={c.id}
              className="lift flex gap-4 border border-chalk/[0.12] bg-surface/40 p-5 hover:border-chalk/30"
              style={{ ['--reveal-delay' as string]: `${i * 40}ms` }}
            >
              <span className="mt-0.5 shrink-0 scale-125 text-chalk">
                <MarkGlyph shape={c.mark} label={c.label} />
              </span>
              <div>
                <dt className="font-display text-[21px] text-chalk">{c.label}</dt>
                <dd className="mt-1 text-[15px] leading-snug text-chalk/75">{c.definition}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal as="section" className="mt-20">
        <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
          The three lenses
          <span aria-hidden className="h-px flex-1 bg-chalk/15" />
        </h2>
        <dl className="mt-8 grid gap-6 lg:grid-cols-3">
          {lenses.map((l) => (
            <div key={l.id} className="border-t-2 border-chalk/30 pt-4">
              <dt className="font-display text-fluid-h3 text-chalk">{l.label}</dt>
              <dd className="mt-2 text-[16px] leading-relaxed text-chalk/80">
                {l.blurb}
                <span className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-unmarked">
                  {l.groups.map((g) => (
                    <span key={g.id} className="border border-chalk/15 px-2 py-0.5">
                      {g.label}
                    </span>
                  ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal as="section" className="mt-20">
        <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
          Where it is incomplete
          <span aria-hidden className="h-px flex-1 bg-chalk/15" />
        </h2>
        <div className="prose-measure mt-6 space-y-4 text-fluid-base text-chalk/85">
          <p>
            Coverage grows where the author&rsquo;s curiosity goes, and the site
            says so plainly rather than implying completeness.{' '}
            <span className="numeral text-chalk">{sports.length}</span> sports
            have researched rule changes;{' '}
            <span className="numeral text-chalk">{rules.length}</span> rule
            changes and <span className="numeral text-chalk">{series.length}</span>{' '}
            series are recorded, and{' '}
            <span className="numeral text-chalk">{play.length}</span> have their
            laws in force written out.
          </p>
          <p>
            Those law summaries carry the same standing as the citations, and
            the same warning: the figures were entered from the named edition
            but have not been checked against its text line by line. They are
            this site&rsquo;s reading of the laws and not a substitute for them,
            which is why every one of them links to the rulebook itself.
          </p>
          <p>
            Two of those series carry no figures. Football&rsquo;s goals per game
            and badminton&rsquo;s match statistics both <em>could</em> exist as
            scoped series and neither has been assembled from a cited source, so
            both state that in place of a chart rather than being filled in from
            recollection. Gymnastics is the different case: there, no series can
            exist at all.
          </p>
          <p>
            Most citations name the right edition without a confirmed article
            number. Every one of those renders as incomplete, and the{' '}
            <Link href="/sources/" className="link-paint text-chalk">
              sources page
            </Link>{' '}
            counts them.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
