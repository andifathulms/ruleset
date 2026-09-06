import type { Metadata } from 'next'
import { Reveal } from '@/components/Motion'
import { getAllRuleChanges, getImages, getSources } from '@/lib/content'
import type { SourceStanding } from '@/lib/types'
import { asset } from '@/lib/asset'

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

const ORDER: SourceStanding[] = ['primary-checked', 'primary-named', 'secondary', 'absent']

export default function SourcesPage() {
  const sources = getSources()
  const rules = getAllRuleChanges()
  const images = getImages()

  const usage = new Map<string, number>()
  for (const r of rules) usage.set(r.citation.source, (usage.get(r.citation.source) ?? 0) + 1)

  const incomplete = rules.filter((r) => r.citation.missing || !r.citation.article)
  const checkedPct = Math.round(((rules.length - incomplete.length) / rules.length) * 100)

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-12 sm:py-16">
      <Reveal>
        <p className="eyebrow">What this rests on</p>
        <h1 className="display-xl mt-4 max-w-[14ch] text-fluid-h1 text-chalk">Sources</h1>
        <div className="prose-measure mt-5 space-y-4 text-fluid-base text-chalk/85">
          <p>
            Rulebooks are published, versioned and public, which is the main
            reason this subject is tractable at all. Every entry cites an edition
            and, where confirmed, an article — never a summary of one.
          </p>
          <p>
            Each source below carries its standing: how far the citation has
            actually been checked. This is rendered rather than hidden, because a
            site that presents an unconfirmed article the same way as a confirmed
            one is claiming more than it knows.
          </p>
        </div>
      </Reveal>

      {/* How much of the corpus is actually confirmed, as a bar rather than a
          sentence you have to do arithmetic on. */}
      <Reveal delay={80}>
        <div className="mt-10 border chalk-rule bg-surface/40 p-5 sm:p-7">
          <p className="flex flex-wrap items-baseline gap-x-3 text-[15px] text-unmarked">
            <span className="numeral text-fluid-h2 leading-none text-chalk">{checkedPct}%</span>
            <span>
              of {rules.length} rule changes cite a confirmed article. The other{' '}
              <span className="numeral text-chalk">{incomplete.length}</span> name
              the right edition and say so.
            </span>
          </p>
          <div
            aria-hidden
            className="mt-5 flex h-3 w-full overflow-hidden bg-chalk/[0.07]"
          >
            <span
              className="block h-full bg-chalk transition-[width] duration-1000 ease-paint"
              style={{ width: `${checkedPct}%` }}
            />
            <span
              className="block h-full bg-unmarked/50"
              style={{ width: `${100 - checkedPct}%` }}
            />
          </div>
          <p className="mt-2 flex justify-between text-[13px] text-unmarked">
            <span>Confirmed article</span>
            <span>Edition named, article unconfirmed</span>
          </p>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <dl className="mt-8 grid gap-px border chalk-rule bg-chalk/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((k) => {
            const n = sources.filter((s) => s.standing === k).length
            return (
              <div key={k} className="bg-ink p-5">
                <p className="numeral text-fluid-h3 leading-none text-chalk">{n}</p>
                <dt className="mt-1.5 font-display text-[19px] text-chalk">{STANDING[k].label}</dt>
                <dd className="mt-1 text-[14px] leading-snug text-unmarked">{STANDING[k].blurb}</dd>
              </div>
            )
          })}
        </dl>
      </Reveal>

      {images.length > 0 && (
        <Reveal as="section" className="mt-14 border-t chalk-rule pt-10">
          <h2 className="flex items-baseline gap-4 font-display text-fluid-h2 text-chalk">
            Images
            <span className="numeral text-[18px] text-unmarked">{images.length}</span>
            <span aria-hidden className="h-px flex-1 bg-chalk/15" />
          </h2>
          <p className="prose-measure mt-4 text-fluid-base text-unmarked">
            Photographs are borrowed, so they are cited like everything else
            borrowed here: author, licence, and the page they came from. Each
            one is also captioned with what it is actually evidence of, which is
            usually narrower than the section it sits in — a portrait of a
            thrower is evidence of the thrower, not of the rule beside it. The
            diagrams elsewhere on the site are drawn here and carry no credit
            because none is owed.
          </p>
          <ul className="mt-8 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {images.map((img) => (
              <li key={img.id} className="flex gap-4 border-t border-chalk/10 pt-4">
                <span
                  aria-hidden
                  className="mt-1 h-12 w-12 shrink-0 border border-chalk/15 bg-cover bg-center opacity-70"
                  style={{ backgroundImage: `url(${asset(img.file)})`, filter: 'grayscale(1)' }}
                />
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug text-chalk/85">{img.alt}</p>
                  <p className="mt-1 text-[13px] text-unmarked">
                    {img.author}
                    {' · '}
                    {img.licence_url ? (
                      <a
                        href={img.licence_url}
                        className="link-paint"
                        target="_blank"
                        rel="noopener noreferrer license"
                      >
                        {img.licence}
                      </a>
                    ) : (
                      img.licence
                    )}
                    {' · '}
                    <a
                      href={img.source_url}
                      className="link-paint"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Commons
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <ul className="mt-14 border-t chalk-rule">
        {sources.map((s, i) => (
          <Reveal
            as="li"
            key={s.id}
            delay={Math.min(i, 8) * 40}
            className="border-b chalk-rule py-7 transition-colors hover:bg-chalk/[0.02]"
          >
            <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
                  <h2 className="font-display text-fluid-h3 text-chalk">
                    {s.url ? (
                      <a
                        href={s.url}
                        className="link-paint"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
                </div>
                <p className="mt-1.5 text-[15px] text-unmarked">
                  {s.publisher} · {s.kind}
                </p>
                {s.note && (
                  <p className="prose-measure mt-2.5 text-[16px] text-chalk/80">{s.note}</p>
                )}
              </div>

              <p className="flex items-baseline gap-2 text-[14px] text-unmarked lg:justify-end">
                {usage.has(s.id) ? (
                  <>
                    <span className="numeral text-[26px] text-chalk">{usage.get(s.id)}</span>
                    <span>rule change{usage.get(s.id) === 1 ? '' : 's'} rest on this</span>
                  </>
                ) : (
                  <span>Cited by no rule change yet</span>
                )}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}
