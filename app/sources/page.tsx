import type { Metadata } from 'next'
import { getAllRuleChanges, getSources } from '@/lib/content'
import type { SourceStanding } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Sources',
  description: 'Every source cited, with how far each citation has actually been checked.',
}

const STANDING: Record<SourceStanding, { label: string; blurb: string }> = {
  'primary-checked': {
    label: 'Primary, checked',
    blurb: 'The named edition and article were opened and read.',
  },
  'primary-named': {
    label: 'Primary, named',
    blurb: 'The right document, but the article number here has not been confirmed against the text.',
  },
  secondary: {
    label: 'Secondary',
    blurb: 'A governing-body statement, circular, or press account rather than the rulebook itself.',
  },
  absent: {
    label: 'Absent',
    blurb: 'No source found. Entries relying on this render as incomplete.',
  },
}

export default function SourcesPage() {
  const sources = getSources()
  const rules = getAllRuleChanges()

  const usage = new Map<string, number>()
  for (const r of rules) usage.set(r.citation.source, (usage.get(r.citation.source) ?? 0) + 1)

  const incomplete = rules.filter((r) => r.citation.missing || !r.citation.article)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-5xl text-chalk">Sources</h1>
      <div className="prose-measure mt-4 space-y-4 text-[17px] text-chalk/85">
        <p>
          Rulebooks are published, versioned and public, which is the main reason
          this subject is tractable at all. Every entry cites an edition and,
          where confirmed, an article — never a summary of one.
        </p>
        <p>
          Each source below carries its standing: how far the citation has
          actually been checked. This is rendered rather than hidden, because a
          site that presents an unconfirmed article the same way as a confirmed
          one is claiming more than it knows.
        </p>
        <p className="text-unmarked">
          <span className="numeral text-chalk">{incomplete.length}</span> of{' '}
          <span className="numeral text-chalk">{rules.length}</span> rule changes
          currently render as incomplete: the edition is identified but the
          article is not confirmed against the text.
        </p>
      </div>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(STANDING) as SourceStanding[]).map((k) => (
          <div key={k} className="border-t-2 border-chalk/30 pt-3">
            <dt className="font-display text-[19px] text-chalk">{STANDING[k].label}</dt>
            <dd className="mt-1 text-[14px] text-unmarked">{STANDING[k].blurb}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-12 border-t chalk-rule">
        {sources.map((s) => (
          <li key={s.id} className="border-b chalk-rule py-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-display text-2xl text-chalk">
                {s.url ? (
                  <a href={s.url} className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
              </h2>
              <span
                className={`border px-2 py-0.5 text-[12px] ${
                  s.standing === 'primary-checked'
                    ? 'border-chalk/60 text-chalk'
                    : 'border-unmarked text-unmarked'
                }`}
              >
                {STANDING[s.standing].label}
              </span>
              {usage.has(s.id) && (
                <span className="numeral text-[14px] text-unmarked">
                  cited by {usage.get(s.id)} rule change{usage.get(s.id) === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="mt-1 text-[15px] text-unmarked">
              {s.publisher} · {s.kind}
            </p>
            {s.note && <p className="prose-measure mt-2 text-[16px] text-chalk/80">{s.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
