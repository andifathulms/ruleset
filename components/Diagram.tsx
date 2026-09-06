import { Reveal } from './Motion'

const BRIGHT: Record<string, string> = {
  pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0',
}

/**
 * The frame every explanatory diagram sits in.
 *
 * A diagram here explains what a rule changed — the geometry of an implement,
 * who is allowed to score, the shape of a scale. It is not a series and must
 * never be mistaken for one, so nothing in this frame carries a time axis and
 * the caption says what is being shown rather than what it implies.
 */
export default function Diagram({
  title,
  eyebrow,
  caption,
  colour = 'unmarked',
  children,
}: {
  title: string
  eyebrow?: string
  caption: string
  colour?: string
  children: React.ReactNode
}) {
  const bright = BRIGHT[colour] ?? BRIGHT.unmarked
  return (
    <Reveal as="figure" className="my-10">
      <figcaption className="mb-4">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h3 className="mt-1.5 font-display text-fluid-h3 text-chalk">{title}</h3>
      </figcaption>
      <div
        className="border chalk-rule bg-surface/40 p-5 sm:p-8"
        style={{ borderTopColor: bright, borderTopWidth: 2 }}
      >
        {children}
      </div>
      <p className="mt-3 max-w-measure text-[14px] leading-relaxed text-unmarked">{caption}</p>
    </Reveal>
  )
}

export { BRIGHT as DIAGRAM_BRIGHT }
