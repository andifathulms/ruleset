import Link from 'next/link'
import type { Metadata } from 'next'
import { Reveal } from '@/components/Motion'
import SportsBrowser, { type BrowserLens, type SportCard } from '@/components/SportsBrowser'
import {
  getAllRuleChanges, getAllSeries, getCover, getLenses, getProgrammes, getSports,
} from '@/lib/content'

export const metadata: Metadata = {
  title: 'Sports',
  description: 'Two layers, marked as such: the researched sports, and the rest of the Olympic, Asian Games and World Games programmes as status data only.',
}

/* The lenses the index can group by. The official lens is left out: it is
   one sport to one group, which groups nothing. */
const BROWSE_LENSES = ['adjudication', 'game-category', 'standing']
const DEFAULT_LENS = 'adjudication'

export default function SportsIndex() {
  const deep = getSports()
  const rules = getAllRuleChanges()
  const series = getAllSeries()
  const lenses = getLenses()

  /* Across every programme, not only the Olympic one. Deduplicated by id,
     because a sport uncovered here is uncovered once however many programmes
     happen to list it. */
  const skeletonOnly = [
    ...new Map(
      getProgrammes()
        .flatMap((p) => p.sports)
        .filter((s) => s.coverage === 'skeleton')
        .map((s) => [s.id, s]),
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label))

  /* Which programmes each uncovered sport appears on — the only thing this
     site actually knows about them. */
  const listedOn = new Map<string, string[]>()
  for (const p of getProgrammes()) {
    for (const sport of p.sports) {
      if (sport.coverage !== 'skeleton') continue
      listedOn.set(sport.id, [...(listedOn.get(sport.id) ?? []), p.short])
    }
  }

  /* One shared span for every card's lane, so the lanes can be read against
     each other. */
  const allYears = rules.map((r) => Number(r.date_effective.slice(0, 4)))
  const span: [number, number] = [Math.min(...allYears) - 4, Math.max(...allYears) + 4]

  const browse: BrowserLens[] = BROWSE_LENSES.map((id) => lenses.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({
      id: l.id,
      label: l.label,
      groups: l.groups.map((g) => ({ label: g.label, colour: g.colour ?? 'unmarked' })),
    }))

  const cards: SportCard[] = deep.map((s) => {
    const own = rules.filter((r) => r.scope.sport === s.id)
    const ownSeries = series.filter((x) => x.sport === s.id)
    const cover = getCover(s)
    return {
      id: s.id,
      label: s.label,
      tagline: s.tagline ?? '',
      governingBody: s.governing_body,
      colour: s.family_colour,
      years: own.map((r) => Number(r.date_effective.slice(0, 4))),
      breaks: [...new Set(ownSeries.flatMap((x) => x.series.breaks.map((b) => b.at)))],
      series: ownSeries.length,
      groups: Object.fromEntries(
        browse.map((l) => {
          const lensData = lenses.find((x) => x.id === l.id)!
          const group = lensData.groups.find((g) => g.members.includes(s.id))
          return [l.id, group?.label ?? 'Unclassified']
        }),
      ),
      cover: cover
        ? {
            file: cover.file,
            alt: cover.alt,
            width: cover.width,
            height: cover.height,
            position: s.cover_position,
          }
        : null,
    }
  })

  const breakCount = cards.reduce((n, c) => n + c.breaks.length, 0)

  return (
    <div className="mx-auto max-w-[86rem] px-5 pb-12 pt-12 sm:pt-16">
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="display-xl text-fluid-mega text-chalk">Sports</h1>
            <p className="prose-measure mt-6 text-fluid-lead text-chalk/85">
              {deep.length} sports have researched rule changes with a cause and a
              citation apiece, and their{' '}
              <Link href="/play/" className="link-paint text-chalk">
                laws in force
              </Link>{' '}
              written out. The other {skeletonOnly.length}, drawn from the Olympic,
              Asian Games and World Games programmes, are status data only and
              carry none of that authority.
            </p>
          </div>
          <dl className="flex gap-8">
            <Total value={deep.length} label="sports" />
            <Total value={rules.length} label="rule changes" />
            <Total value={breakCount} label="breaks" accent />
          </dl>
        </div>
      </Reveal>

      <SportsBrowser sports={cards} lenses={browse} span={span} defaultLens={DEFAULT_LENS} />

      {/* Rule 6: status and classification only, and drawn so it cannot be
          mistaken for the researched layer — hatched, quieter, no covers and
          no lanes. */}
      <section className="unentered mt-20 border border-dashed border-unmarked/50 px-5 py-6 sm:px-7">
        <h2 className="flex items-baseline gap-4 font-display text-fluid-h3 text-dim">
          Not yet covered
          <span className="numeral text-[18px] text-unmarked">{skeletonOnly.length}</span>
        </h2>
        <p className="prose-measure mt-2 text-[15px] text-unmarked">
          Status and classification only. No rule research has been done on
          these, and nothing here should be read as though it had. Beside each
          is the programme that lists it.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {skeletonOnly.map((s) => (
            <li key={s.id}>
              <Link
                href="/program/"
                className="flex items-baseline gap-2 border chalk-rule bg-ink px-3 py-1.5 text-[14px] text-dim transition-colors hover:border-chalk/40 hover:text-chalk"
              >
                {s.label}
                <span className="text-[12px] text-unmarked">
                  {(listedOn.get(s.id) ?? []).join(' · ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Total({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-1.5 text-[13px] text-unmarked">{label}</dt>
      <dd className={`numeral text-[44px] font-bold leading-none ${accent ? 'text-clay-bright' : 'text-chalk'}`}>
        {value}
      </dd>
    </div>
  )
}
