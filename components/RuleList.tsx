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
    <ol className="border-l-2 border-chalk/25">
      {rules.map((rule) => {
        const cause = causeMap[rule.cause_primary]
        const source = sources[rule.citation.source]
        const incomplete = Boolean(rule.citation.missing) || !rule.citation.article
        const broke = series.find((s) => s.break?.caused_by === rule.id)

        return (
          <li key={rule.id} id={rule.id} className="relative scroll-mt-8 py-8 pl-6">
            {broke && (
              // The only element allowed to interrupt this line.
              <span
                aria-hidden
                className="absolute -left-[2px] top-8 h-8 w-5 -translate-x-1/2 border-b-2 border-l-2 border-chalk/50"
              />
            )}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="numeral text-3xl text-chalk">{rule.date_effective}</span>
              <span className="flex items-center gap-1.5 text-[14px] text-chalk/80">
                {cause && <MarkGlyph shape={cause.mark} label={cause.label} />}
                {cause?.label ?? rule.cause_primary}
                {rule.cause_secondary && (
                  <span className="text-unmarked">· {rule.cause_secondary}</span>
                )}
              </span>
              {rule.status && rule.status !== 'adopted' && (
                <span className="border border-unmarked px-2 py-0.5 text-[12px] text-unmarked">
                  {STATUS[rule.status]}
                </span>
              )}
            </div>

            <p className="prose-measure mt-3 text-[17px] text-chalk/90">{rule.what_changed}</p>

            {rule.trigger && (
              <div className="prose-measure mt-4">
                <p className="text-[13px] uppercase tracking-[0.14em] text-unmarked">Trigger</p>
                <p className="mt-1 text-[16px] text-chalk/85">{rule.trigger.description}</p>
                {rule.trigger.also_said && (
                  <p className="mt-3 border-l-2 border-unmarked pl-4 text-[16px] text-chalk/75">
                    {rule.trigger.also_said}
                  </p>
                )}
              </div>
            )}

            {broke && (
              <p className="prose-measure mt-4 border-l-2 border-chalk/50 pl-4 text-[16px] text-chalk/85">
                <span className="text-[13px] uppercase tracking-[0.14em] text-unmarked">
                  Comparability break · {BREAK_KIND_LABEL[broke.break!.kind]}
                </span>
                <br />
                {broke.break!.note.replace(/\s+/g, ' ')}{' '}
                <Link href={`#${broke.id}`} className="text-chalk underline underline-offset-4">
                  See the series
                </Link>
              </p>
            )}

            <p className={`mt-4 text-[14px] ${incomplete ? 'text-unmarked' : 'text-chalk/70'}`}>
              {source ? (
                source.url ? (
                  <a
                    href={source.url}
                    className="underline underline-offset-4"
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
                <span className="ml-2 border border-unmarked px-2 py-0.5 text-[12px]">
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
