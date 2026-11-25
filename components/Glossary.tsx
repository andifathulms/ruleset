import Emphasis from '@/components/Emphasis'
import type { Glossary as GlossaryData, Play } from '@/lib/types'

/**
 * The sport's vocabulary, defined once. Each entry is an anchor that the
 * essays link to with `<Term>`, and an entry whose word is at work in a
 * particular clause of the laws points back at that clause.
 */
export default function Glossary({
  glossary, play, colour,
}: {
  glossary: GlossaryData
  play: Play | null
  colour: { base: string; bright: string }
}) {
  const clause = Object.fromEntries((play?.sections ?? []).map((s) => [s.id, s.label]))
  return (
    <dl className="grid gap-px border chalk-rule bg-chalk/15 sm:grid-cols-2 xl:grid-cols-3">
      {glossary.terms.map((t) => (
        <div key={t.id} id={`term-${t.id}`} className="term scroll-anchor bg-ink px-4 py-4 sm:px-5">
          <dt className="font-display text-[22px] leading-tight" style={{ color: colour.bright }}>
            {t.term}
          </dt>
          <dd className="mt-1.5 text-[15.5px] leading-relaxed text-chalk/85">
            <Emphasis>{t.definition.replace(/\s+/g, ' ').trim()}</Emphasis>
          </dd>
          {t.see && clause[t.see] && (
            <dd className="mt-2 text-[13px] text-unmarked">
              In the laws:{' '}
              <a href={`#law-${t.see}`} className="link-paint text-chalk/80 hover:text-chalk">
                {clause[t.see]}
              </a>
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}
