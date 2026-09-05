import Link from 'next/link'
import { MarkGlyph } from './Mark'
import { BREAK_KIND_LABEL } from '@/lib/series'
import type { Cause, RuleChange, Series, Source } from '@/lib/types'

const STATUS: Record<string, string> = {
  withdrawn: 'Adopted, then rescinded before it was ever enforced',
  'trial-only': 'Trialled, then abandoned',
}

/**
 * A rule change rendered in full. Rule 2: an entry whose citation is missing or
 * unconfirmed renders as incomplete, in `unmarked`, rather than looking finished.
 */
export default function RuleList({
  rules, causes, sources, series,
}: {
  rules: RuleChange[]
  causes: Cause[]
  sources: Record<string, Source>
  series: Series[]
}) {
  const causeMap = Object.fromEntries(causes.map((c) => [c.id, c]))

  return (
    <ol className="border-l-2 border-chalk/20">
      {rules.map((rule) => {
        const cause = causeMap[rule.cause_primary]
        const source = sources[rule.citation.source]
        const incomplete = Boolean(rule.citation.missing) || !rule.citation.article
        const broke = series.find((s) => s.break?.caused_by === rule.id)

        return (
          <li
            key={rule.id}
            id={rule.id}
            className="group relative scroll-mt-24 py-9 pl-7 transition-colors hover:bg-chalk/[0.02]"
          >
            {broke ? (
              // The only element allowed to interrupt this line.
              <span
                aria-hidden
                className="absolute -left-[2px] top-9 h-8 w-5 -translate-x-1/2 border-b-2 border-l-2 border-chalk/50"
              />
            ) : (
              <span
                aria-hidden
                className="absolute -left-[5px] top-[3.15rem] h-2 w-2 bg-chalk/40 transition-colors group-hover:bg-chalk"
              />
            )}

            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="numeral text-fluid-h3 leading-none text-chalk">
                {rule.date_effective}
              </span>
              <span className="flex items-center gap-2 border border-chalk/15 px-2.5 py-1 text-[13.5px] text-chalk/85">
                {cause && <MarkGlyph shape={cause.mark} label={cause.label} />}
                {cause?.label ?? rule.cause_primary}
              </span>
              {rule.cause_secondary && (
                <span className="text-[13.5px] text-unmarked">
                  also {rule.cause_secondary}
                </span>
              )}
              {rule.status && rule.status !== 'adopted' && (
                <span className="border border-dashed border-unmarked px-2 py-0.5 text-[12px] text-unmarked">
                  {STATUS[rule.status]}
                </span>
              )}
              {rule.date_adopted && (
                <span className="numeral ml-auto text-[13px] text-unmarked">
                  adopted {rule.date_adopted}
                </span>
              )}
            </div>

            <p className="prose-measure mt-4 text-fluid-base text-chalk/90">{rule.what_changed}</p>

            {rule.trigger && (
              <div className="prose-measure mt-5 border-l border-chalk/15 pl-5">
                <p className="eyebrow">Trigger</p>
                <p className="mt-1.5 text-[16px] text-chalk/85">{rule.trigger.description}</p>
                {rule.trigger.also_said && (
                  <p className="mt-3 border-l-2 border-unmarked pl-4 text-[16px] text-chalk/75">
                    {rule.trigger.also_said}
                  </p>
                )}
              </div>
            )}

            {broke && (
              <div className="prose-measure mt-5 border-l-2 border-chalk/50 bg-chalk/[0.03] py-4 pl-5">
                <p className="eyebrow">
                  Comparability break · {BREAK_KIND_LABEL[broke.break!.kind]}
                </p>
                <p className="mt-1.5 text-[16px] text-chalk/85">
                  {broke.break!.note.replace(/\s+/g, ' ')}{' '}
                  <Link href={`#${broke.id}`} className="link-paint text-chalk">
                    See the series
                  </Link>
                </p>
              </div>
            )}

            <p className={`mt-5 text-[14px] ${incomplete ? 'text-unmarked' : 'text-chalk/70'}`}>
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
              {incomplete && (
                <span className="ml-2 whitespace-nowrap border border-unmarked px-2 py-0.5 text-[12px]">
                  Incomplete — no confirmed article
                </span>
              )}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
