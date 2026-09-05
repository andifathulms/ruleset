const BRIGHT: Record<string, string> = {
  pool: '#57ACE8',
  pitch: '#5CC684',
  clay: '#EA7E4E',
  gold: '#F2C94F',
  unmarked: '#9FB2B0',
}

/**
 * One sport's lane at card size: the same chalk line, the same rule that a
 * break — and only a break — may interrupt it.
 *
 * Marks are vertical ticks rather than dots. Dots were drawn as circles in a
 * viewBox stretched to the card width, which rendered them as ellipses about
 * 40% wider than tall; a tick paired with a non-scaling stroke is immune to
 * that stretch, and a tick on a painted line is the site's own grammar anyway.
 * They carry no cause: a shape too small to be told from its neighbours would
 * be a cause claimed illegibly.
 */
export default function MiniLane({
  years,
  breaks = [],
  colour = 'unmarked',
  from,
  to,
  className = '',
}: {
  years: number[]
  breaks?: number[]
  colour?: string
  from: number
  to: number
  className?: string
}) {
  const W = 260
  const H = 40
  const bright = BRIGHT[colour] ?? BRIGHT.unmarked
  const span = Math.max(1, to - from)
  const x = (y: number) => 4 + ((y - from) / span) * (W - 8)

  /* The line in pieces: it stops at each break, steps, and resumes offset.
     Deduplicated by year — swimming has two series severed by the same 2010
     rule, and cutting twice at one x produced a zero-width segment between
     them and a step that went down and straight back up, which drew as a T
     rather than as a break. One rule change is one break in the lane however
     many series it severed. */
  const cuts = Array.from(
    new Set(breaks.filter((b) => b > from && b < to)),
  ).sort((a, b) => a - b)
  const pieces: { x1: number; x2: number; dy: number }[] = []
  const steps: { x: number; from: number; to: number }[] = []
  let cursor = 4
  let dy = 0
  cuts.forEach((year, i) => {
    const at = x(year)
    pieces.push({ x1: cursor, x2: at - 5, dy })
    const next = dy + (i % 2 === 0 ? -7 : 7)
    steps.push({ x: at, from: dy, to: next })
    dy = next
    cursor = at + 5
  })
  pieces.push({ x1: cursor, x2: W - 4, dy })

  const mid = H / 2
  const offsetAt = (px: number) => pieces.find((p) => px >= p.x1 && px <= p.x2)?.dy ?? dy

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {pieces.map((p, i) => (
        <line
          key={i}
          x1={p.x1} x2={p.x2} y1={mid + p.dy} y2={mid + p.dy}
          stroke="#F2F5F1" strokeOpacity={0.55} strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {steps.map((s, i) => (
        <line
          key={i}
          x1={s.x} x2={s.x} y1={mid + s.from} y2={mid + s.to}
          stroke="#F2F5F1" strokeOpacity={0.35} strokeWidth={1.25} strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {years.map((yr, i) => {
        const px = x(yr)
        const cy = mid + offsetAt(px)
        // A rule change that severed a series wears a taller tick in the
        // family colour, so the break reads at a glance and not only as a
        // step you have to look for.
        const broke = breaks.includes(yr)
        const half = broke ? 8 : 4.5
        return (
          <line
            key={`${yr}-${i}`}
            x1={px} x2={px} y1={cy - half} y2={cy + half}
            stroke={broke ? bright : '#F2F5F1'}
            strokeWidth={broke ? 2.5 : 2}
            strokeLinecap="butt"
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}
