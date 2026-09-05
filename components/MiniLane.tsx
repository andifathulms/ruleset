const BRIGHT: Record<string, string> = {
  pool: '#57ACE8',
  pitch: '#5CC684',
  clay: '#EA7E4E',
  gold: '#F2C94F',
  unmarked: '#9FB2B0',
}

/**
 * One sport's lane at card size: the same chalk line, the same rule that a
 * break — and only a break — may interrupt it. Marks are plain dots here
 * rather than cause glyphs, because at this size a shape could not be read and
 * a shape that cannot be read is a cause claimed without being legible.
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
  const H = 34
  const bright = BRIGHT[colour] ?? BRIGHT.unmarked
  const span = Math.max(1, to - from)
  const x = (y: number) => 4 + ((y - from) / span) * (W - 8)

  // The line in pieces: it stops at each break, steps, and resumes offset.
  const cuts = [...breaks].filter((b) => b > from && b < to).sort((a, b) => a - b)
  const pieces: { x1: number; x2: number; dy: number }[] = []
  const steps: { x: number; from: number; to: number }[] = []
  let cursor = 4
  let dy = 0
  cuts.forEach((year, i) => {
    const at = x(year)
    pieces.push({ x1: cursor, x2: at - 4, dy })
    const next = dy + (i % 2 === 0 ? -5 : 5)
    steps.push({ x: at, from: dy, to: next })
    dy = next
    cursor = at + 4
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
          stroke="#F2F5F1" strokeOpacity={0.3} strokeWidth={1.25} strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {years.map((yr, i) => (
        <circle
          key={`${yr}-${i}`}
          cx={x(yr)}
          cy={mid + offsetAt(x(yr))}
          r={2.6}
          fill={breaks.includes(yr) ? bright : '#F2F5F1'}
        />
      ))}
    </svg>
  )
}
