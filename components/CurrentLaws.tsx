import Link from 'next/link'
import { Reveal } from './Motion'
import { headline } from '@/lib/text'
import type { Play, RuleChange, Source } from '@/lib/types'

/**
 * The laws as they stand, which is the question a reader usually arrives with
 * and which the rest of this site never answered. It is deliberately not a
 * neutral encyclopedia entry: every clause that a recorded rule change produced
 * links back to that change, so the current law reads as the accumulated output
 * of the timeline rather than as a set of facts that were always true.
 */
export default function CurrentLaws({
  play, rules, source, colour, sportLabel,
}: {
  play: Play
  rules: RuleChange[]
  source?: Source
  colour: { base: string; bright: string }
  sportLabel: string
}) {
  const ruleMap = Object.fromEntries(rules.map((r) => [r.id, r]))
  const unchecked = play.standing !== 'primary-checked'

  return (
    <div>
      <p className="prose-measure text-[17px] text-chalk/85">{clean(play.summary)}</p>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y chalk-rule py-3 text-[14px]">
        <span className="text-unmarked">In force</span>
        <span className="text-chalk">{play.edition}</span>
        <span className="text-unmarked">
          Snapshot taken <span className="numeral">{play.as_of}</span>
        </span>
        {source?.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-paint ml-auto text-chalk/75 hover:text-chalk"
          >
            The rulebook itself
          </a>
        )}
      </div>

      {/* The same standing model the citations use. A figure entered from the
          right edition but not checked against it says so, at the top, once. */}
      {unchecked && (
        <p className="mt-4 border-l-2 border-unmarked pl-4 text-[15px] text-unmarked">
          These figures were entered from the edition named above but have not
          been checked against its text line by line. Treat them as this
          site&rsquo;s reading of the laws, not as a substitute for them.
        </p>
      )}

      <div className="mt-10 space-y-12">
        {play.sections.map((section) => (
          <Reveal key={section.id}>
            <section id={`law-${section.id}`} className="scroll-anchor">
              <h4 className="font-display text-2xl text-chalk">{section.label}</h4>

              <div className="prose-measure mt-3 space-y-4 text-[16px] text-chalk/85">
                {paragraphs(section.body).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Columns follow the count. Padding two facts out to three
                  columns left an empty bordered cell that reads as a missing
                  fact rather than as spacing. */}
              {section.facts && section.facts.length > 0 && (
                <dl
                  className={`mt-5 grid gap-px border chalk-rule bg-chalk/15 sm:grid-cols-2 ${
                    section.facts.length % 3 === 0 || section.facts.length > 4
                      ? 'lg:grid-cols-3'
                      : ''
                  }`}
                >
                  {section.facts.map((f, i) => (
                    <div key={`${f.label}-${i}`} className="bg-ink px-4 py-3">
                      <dt className="text-[13px] text-unmarked">{f.label}</dt>
                      <dd className="numeral mt-0.5 text-[19px] text-chalk">{f.value}</dd>
                      {f.note && (
                        <dd className="mt-1 text-[13px] leading-snug text-unmarked">{f.note}</dd>
                      )}
                    </div>
                  ))}
                  {/* Only ever needed when the count does divide by three. */}
                  {section.facts.length % 3 === 0
                    ? null
                    : fillers(section.facts.length).map((k) => (
                        <div key={k} aria-hidden className="hidden bg-ink lg:block" />
                      ))}
                </dl>
              )}

              {/* The link that makes this a section of THIS site. */}
              {section.shaped_by && section.shaped_by.length > 0 && (
                <div className="mt-5 border-l-2 pl-4" style={{ borderColor: colour.bright }}>
                  <p className="text-[13px] uppercase tracking-[0.14em] text-unmarked">
                    This clause reads this way because of
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {section.shaped_by.map((id) => {
                      const rule = ruleMap[id]
                      if (!rule) return null
                      return (
                        <li key={id} className="text-[15px]">
                          <Link href={`#${id}`} className="link-paint text-chalk">
                            <span className="numeral">{rule.date_effective.slice(0, 4)}</span>
                            {' — '}
                            {headline(rule.what_changed, 96)}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {section.citation && (
                <p
                  className={`mt-4 text-[13px] ${
                    section.citation.missing || !section.citation.article
                      ? 'text-unmarked'
                      : 'text-chalk/65'
                  }`}
                >
                  {section.citation.edition ?? play.edition}
                  {section.citation.article ? ` · ${section.citation.article}` : ''}
                  {(section.citation.missing || !section.citation.article) &&
                    ' · article not confirmed'}
                </p>
              )}
            </section>
          </Reveal>
        ))}
      </div>

      <p className="mt-10 text-[15px] text-unmarked">
        Everything above is current law. Everything below is how {sportLabel} got
        here.
      </p>
    </div>
  )
}

const clean = (s: string) => s.replace(/[ \t]+/g, ' ').trim()

/**
 * A YAML folded scalar joins wrapped lines with a space and collapses a blank
 * line to a single newline, so paragraphs split on one \n and not two.
 */
const paragraphs = (body: string) =>
  clean(body)
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)

/** Empty cells needed to square off the last row of a three-column grid. */
const fillers = (n: number) =>
  Array.from({ length: (3 - (n % 3)) % 3 }, (_, i) => `filler-${i}`)

