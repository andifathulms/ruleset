import Link from 'next/link'
import type { Metadata } from 'next'
import { MarkGlyph } from '@/components/Mark'
import { getAllRuleChanges, getAllSeries, getCauses, getLenses, getSports } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About',
  description: 'What this site treats as a fact, what it refuses to draw, and where it is incomplete.',
}

export default function AboutPage() {
  const causes = getCauses()
  const lenses = getLenses()
  const rules = getAllRuleChanges()
  const series = getAllSeries()
  const sports = getSports()

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-5xl text-chalk">About</h1>

      <div className="prose-measure mt-5 space-y-4 text-[17px] text-chalk/85">
        <p>
          This site treats a rule change as a first-class object with a cause, a
          date, a citation, and a measurable consequence. The consequence is
          often that a number series stops being continuous, and that is the part
          nobody records systematically.
        </p>
        <p>
          Read-only, static, and built for its author to read. There is no
          ranking of sports against each other, no live data, and no estimated
          numbers anywhere.
        </p>
      </div>

      <h2 className="mt-14 font-display text-3xl text-chalk">What it refuses to do</h2>
      <ul className="prose-measure mt-4 space-y-4 text-[17px] text-chalk/85">
        <li>
          <strong className="text-chalk">Draw a line across a break.</strong>{' '}
          Segments are separate paths on separate scales with a visible gap. No
          interpolation, no trend line, no shared baseline. This is the whole
          point of the feature and it is enforced in the data layer, not by
          convention.
        </li>
        <li>
          <strong className="text-chalk">Invent a citation.</strong> Every rule
          change needs a real edition and article. Where the article has not been
          confirmed against the text, the entry renders as incomplete rather than
          being quietly finished.
        </li>
        <li>
          <strong className="text-chalk">Infer a cause.</strong> A cause comes
          from a stated reason or a sourced account. Where sources disagree the
          cause is <em>disputed</em> and both readings are kept, because a
          governing body&rsquo;s stated reason and the widely-believed reason are
          often different and the gap is the interesting part.
        </li>
        <li>
          <strong className="text-chalk">Pass a scoped series off as the
          sport&rsquo;s.</strong> Football&rsquo;s goals per game is labelled
          with its competition in the chart title itself, not in a footnote.
        </li>
        <li>
          <strong className="text-chalk">Let the skeleton layer borrow the deep
          layer&rsquo;s authority.</strong> Sports with no rule research show
          status and classification only and are marked as not yet covered
          wherever they appear.
        </li>
      </ul>

      <h2 className="mt-14 font-display text-3xl text-chalk">The cause vocabulary</h2>
      <p className="prose-measure mt-3 text-[16px] text-unmarked">
        Closed, and carried by shape rather than colour — colour is already
        carrying sport family, and eleven hues on one screen destroyed that
        reading. Shape also survives greyscale and colour-blind viewing.
      </p>
      <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
        {causes.map((c) => (
          <div key={c.id} className="flex gap-3">
            <span className="mt-1 shrink-0 text-chalk">
              <MarkGlyph shape={c.mark} label={c.label} />
            </span>
            <div>
              <dt className="font-display text-[20px] text-chalk">{c.label}</dt>
              <dd className="text-[15px] text-chalk/75">{c.definition}</dd>
            </div>
          </div>
        ))}
      </dl>

      <h2 className="mt-14 font-display text-3xl text-chalk">The three lenses</h2>
      <dl className="mt-5 space-y-6">
        {lenses.map((l) => (
          <div key={l.id}>
            <dt className="font-display text-[22px] text-chalk">{l.label}</dt>
            <dd className="prose-measure text-[16px] text-chalk/80">
              {l.blurb}
              <span className="mt-1 block text-[14px] text-unmarked">
                Lanes: {l.groups.map((g) => g.label).join(' · ')}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-14 font-display text-3xl text-chalk">Where it is incomplete</h2>
      <div className="prose-measure mt-4 space-y-4 text-[17px] text-chalk/85">
        <p>
          Coverage grows where the author&rsquo;s curiosity goes, and the site
          says so plainly rather than implying completeness.{' '}
          <span className="numeral">{sports.length}</span> sports have researched
          rule changes; <span className="numeral">{rules.length}</span> rule
          changes and <span className="numeral">{series.length}</span> series are
          recorded.
        </p>
        <p>
          Two of those series carry no figures. Football&rsquo;s goals per game
          and badminton&rsquo;s match statistics both{' '}
          <em>could</em> exist as scoped series and neither has been assembled
          from a cited source, so both state that in place of a chart rather than
          being filled in from recollection. Gymnastics is the different case:
          there, no series can exist at all.
        </p>
        <p>
          Most citations name the right edition without a confirmed article
          number. Every one of those renders as incomplete, and the{' '}
          <Link href="/sources/" className="text-chalk underline underline-offset-4">
            sources page
          </Link>{' '}
          counts them.
        </p>
      </div>
    </div>
  )
}
