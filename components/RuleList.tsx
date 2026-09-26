import Link from 'next/link'
import Emphasis from '@/components/Emphasis'
import { MarkGlyph } from './Mark'
import { BREAK_KIND_LABEL } from '@/lib/series'
import type { Cause, RuleChange, Series, Source } from '@/lib/types'

const STATUS: Record<string, string> = {
  withdrawn: 'Adopted, then rescinded before it was ever enforced',
  'trial-only': 'Trialled, then abandoned',
}

const BRIGHT: Record<string, string> = {
  pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0',
}

/** How far the spine steps sideways at each break, in px. */
const STEP = 16
/** Where on an entry the spine steps: level with the date. */
const STEP_AT = '3.1rem'

/**
 * A rule change rendered in full. Rule 2: an entry whose citation is missing or
 * unconfirmed renders as incomplete, in `unmarked`, rather than looking finished
 * — and says so on the folded line, so it cannot be hidden by folding.
 *
 * The spine down the left is the sport's own lane turned on its side, and like
 * the lane it may be interrupted only by a break: at a rule that severed a
 * series it stops, steps sideways, and carries on offset. Nothing after that
 * rule sits on the same line as anything before it.
 */
export default function RuleList({
  rules, causes, sources, series, colour = 'unmarked',
}: {
  rules: RuleChange[]
  causes: Cause[]
  sources: Record<string, Source>
  series: Series[]
  colour?: string
}) {
  const causeMap = Object.fromEntries(causes.map((c) => [c.id, c]))
  const bright = BRIGHT[colour] ?? BRIGHT.unmarked
  const brokeBy = (id: string) =>
    series
      .flatMap((s) => s.breaks.map((b) => ({ series: s, brk: b })))
      .find((x) => x.brk.caused_by === id)

  /* The spine's level at each entry: one step per break-causing rule so far. */
  let level = 0
  const entries = rules.map((rule) => {
    const broke = brokeBy(rule.id)
    if (broke) level += 1
    return { rule, broke, level }
  })
  const inset = level * STEP + 30

  return (
    <ol>
      {entries.map(({ rule, broke, level: lvl }) => {
        const cause = causeMap[rule.cause_primary]
        const source = sources[rule.citation.source]
        const incomplete = Boolean(rule.citation.missing) || !rule.citation.article
        const x = lvl * STEP

        return (
          <li
            key={rule.id}
            id={rule.id}
            className="group relative scroll-anchor py-9 transition-colors hover:bg-chalk/[0.02]"
            style={{ paddingLeft: inset }}
          >
            {broke ? (
              /* The only element allowed to interrupt this line. */
              <>
                <span aria-hidden className="absolute top-0 w-[2px] bg-chalk/20" style={{ left: x - STEP, height: STEP_AT }} />
                <span
                  aria-hidden
                  className="absolute h-[2px]"
                  style={{ left: x - STEP, width: STEP + 2, top: STEP_AT, background: bright }}
                />
                <span
                  aria-hidden
                  className="absolute bottom-0 w-[2px]"
                  style={{ left: x, top: STEP_AT, background: `${bright}8c` }}
                />
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-[2px]"
                  style={{ left: x, background: lvl > 0 ? `${bright}8c` : 'rgb(242 245 241 / 0.2)' }}
                />
                <span
                  aria-hidden
                  className="absolute h-2 w-2 bg-chalk/40 transition-colors group-hover:bg-chalk"
                  style={{ left: x - 3, top: 'calc(3.1rem - 3px)' }}
                />
              </>
            )}

            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span
                className="numeral text-fluid-h3 leading-none"
                style={{ color: broke ? bright : undefined }}
              >
                {rule.date_effective}
              </span>
              <span className="flex items-center gap-2 border border-chalk/15 bg-surface px-2.5 py-1 text-[13.5px] text-chalk/85">
                {cause && <MarkGlyph shape={cause.mark} label={cause.label} />}
                {cause?.label ?? rule.cause_primary}
              </span>
              {rule.cause_secondary && (
                <span className="text-[13.5px] text-unmarked">
                  also {rule.cause_secondary}
                </span>
              )}
              {rule.status && rule.status !== 'adopted' && (
                <span className="border border-dashed border-unmarked px-2 py-0.5 text-[12.5px] text-dim">
                  {STATUS[rule.status]}
                </span>
              )}
              {rule.date_adopted && (
                <span className="numeral ml-auto text-[13px] text-unmarked">
                  adopted {rule.date_adopted}
                </span>
              )}
            </div>

            <p className="prose-measure mt-4 text-fluid-base text-chalk/90"><Emphasis>{rule.what_changed}</Emphasis></p>

            {broke && (
              <div
                className="prose-measure mt-5 py-4 pl-5 pr-4"
                style={{
                  borderLeft: `2px solid ${bright}`,
                  background: `linear-gradient(90deg, ${bright}1f, transparent 85%)`,
                }}
              >
                <p className="text-[13px]" style={{ color: bright }}>
                  Comparability break · {BREAK_KIND_LABEL[broke.brk.kind]}
                </p>
                <p className="mt-1.5 text-[16px] text-chalk/85">
                  {broke.brk.note.replace(/\s+/g, ' ')}{' '}
                  <Link href={`#${broke.series.id}`} className="link-paint text-chalk">
                    See the series
                  </Link>
                </p>
              </div>
            )}

            {/* Detail on demand. Open by default where the rule broke a
                series, because there the trigger is the story. */}
            <details className="group/d prose-measure mt-5" open={Boolean(broke)}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-dim transition-colors hover:text-chalk [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="numeral w-3 text-[18px] leading-none text-chalk">
                  <span className="group-open/d:hidden">+</span>
                  <span className="hidden group-open/d:inline">&ndash;</span>
                </span>
                {rule.trigger ? 'Trigger and citation' : 'Citation'}
                {incomplete && (
                  <span className="whitespace-nowrap border border-unmarked px-2 py-0.5 text-[12px] text-unmarked">
                    Incomplete — no confirmed article
                  </span>
                )}
              </summary>

              {rule.trigger && (
                <div className="mt-4 border-l border-chalk/15 pl-5">
                  <p className="eyebrow">Trigger</p>
                  <p className="mt-1.5 text-[16px] text-chalk/85"><Emphasis>{rule.trigger.description}</Emphasis></p>
                  {rule.trigger.also_said && (
                    <p className="mt-3 border-l-2 border-unmarked pl-4 text-[16px] text-chalk/75">
                      <Emphasis>{rule.trigger.also_said}</Emphasis>
                    </p>
                  )}
                </div>
              )}

              <p className={`mt-4 text-[14px] ${incomplete ? 'text-unmarked' : 'text-chalk/70'}`}>
                {source ? (
                  source.url ? (
                    <a
                      href={source.url}
                      className="link-paint"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )
                ) : (
                  rule.citation.source
                )}
                {rule.citation.edition ? ` · ${rule.citation.edition}` : ''}
                {rule.citation.article ? ` · article ${rule.citation.article}` : ''}
              </p>
            </details>
          </li>
        )
      })}
    </ol>
  )
}
