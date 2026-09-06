import type { Events } from '@/lib/types'

/**
 * The sport → discipline → event hierarchy, which the PRD builds its whole
 * taxonomy on and which the site cited without ever showing. The point is the
 * asymmetry: athletics is dozens of events under one rulebook and badminton is
 * five, and until you can see both you cannot see why "a rule" means such
 * different things in the two.
 */
export default function EventTree({
  events, colour,
}: {
  events: Events
  colour: { base: string; bright: string }
}) {
  // Totals count medal events, not rows, and skip groups listed for context.
  const counted = events.disciplines.filter((d) => d.counts !== false)
  const medals = counted.reduce(
    (n, d) => n + d.events.filter((e) => e.olympic).reduce((m, e) => m + (e.count ?? 1), 0),
    0,
  )
  const context = events.disciplines.length - counted.length

  return (
    <div>
      <p className="prose-measure text-[17px] text-chalk/85">{clean(events.summary)}</p>

      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-y chalk-rule py-4">
        <div>
          <dt className="text-[13px] text-unmarked">Disciplines</dt>
          <dd className="numeral text-[26px] text-chalk">{counted.length}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-unmarked">Olympic medal events</dt>
          <dd className="numeral text-[26px] text-chalk">{medals}</dd>
          <dd className="text-[12px] text-unmarked">
            Men&rsquo;s and women&rsquo;s counted separately.
          </dd>
        </div>
        {context > 0 && (
          <div>
            <dt className="text-[13px] text-unmarked">Listed for context</dt>
            <dd className="numeral text-[26px] text-unmarked">{context}</dd>
            <dd className="text-[12px] text-unmarked">Not counted as this sport.</dd>
          </div>
        )}
        <div className="ml-auto self-end text-[13px] text-unmarked">
          As of <span className="numeral">{events.as_of}</span>
        </div>
      </dl>

      <div className="mt-8 space-y-8">
        {events.disciplines.map((d) => (
          <section key={d.id}>
            <h3 className="flex items-baseline gap-3 font-display text-2xl text-chalk">
              <span aria-hidden className="h-2.5 w-2.5 shrink-0" style={{ background: colour.bright }} />
              {d.label}
              <span className="numeral text-[15px] text-unmarked">
                {d.counts === false
                  ? d.events.length
                  : d.events.reduce((m, e) => m + (e.count ?? 1), 0)}
              </span>
            </h3>
            {d.blurb && (
              <p className="prose-measure mt-2 text-[16px] text-chalk/75">{clean(d.blurb)}</p>
            )}
            <ul className="mt-3 grid gap-px bg-chalk/12 sm:grid-cols-2 lg:grid-cols-3">
              {d.events.map((e) => (
                <li key={e.id} className="bg-ink px-4 py-2.5">
                  <span className={e.olympic ? 'text-[15px] text-chalk' : 'text-[15px] text-unmarked'}>
                    {e.label}
                  </span>
                  {!e.olympic && (
                    <span className="ml-2 text-[12px] text-unmarked">not Olympic</span>
                  )}
                  {e.note && (
                    <span className="mt-0.5 block text-[13px] leading-snug text-unmarked">
                      {clean(e.note)}
                    </span>
                  )}
                </li>
              ))}
              {/* The grid's gap colour shows through an unfilled cell. */}
              {Array.from({ length: (3 - (d.events.length % 3)) % 3 }, (_, i) => (
                <li key={`filler-${i}`} aria-hidden className="hidden bg-ink lg:block" />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

const clean = (s: string) => s.replace(/[ \t]+/g, ' ').trim()
