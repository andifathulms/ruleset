const CHALK = '#F2F5F1'
const CLAY = '#EA7E4E'
const UNMARKED = '#7A8C8A'

/**
 * Why match statistics do not survive May 2006.
 *
 * The same sixteen rallies scored under both systems. Under side-out only the
 * serving side could score, so a rally won by the receiver produced no number
 * at all; from 2006 every rally produces one. The two rows are the same play
 * and different data, which is the whole of the comparability break.
 *
 * This is not a series: the horizontal axis is a sequence of rallies within one
 * imagined game, not time, and the two rows are not being compared as values.
 */

// true where the serving side won the rally, and therefore scored under the
// old system. An invented but ordinary-looking run, not a real match.
const RALLIES = [
  true, false, true, true, false, false, true, false,
  true, true, false, true, false, false, true, true,
]

export default function ScoringSystems() {
  const x0 = 92
  const step = 34
  const at = (i: number) => x0 + i * step
  const sideOut = RALLIES.filter(Boolean).length

  return (
    <svg
      viewBox="0 0 720 250"
      role="img"
      aria-label={`The same sixteen rallies scored under both systems. Under fifteen-point side-out scoring only the serving side could score, so the rallies won by the receiver produced no number at all and the game advanced by ${sideOut} points. Under twenty-one-point rally scoring from 2006, every rally produces a point, so the same play advances the game by ${RALLIES.length}.`}
      className="w-full"
    >
      <text x={x0} y="24" className="numeral" fontSize="13" fill={CHALK} fillOpacity="0.55">
        SIXTEEN RALLIES, THE SAME SIXTEEN, SCORED TWICE
      </text>

      {/* Who actually won each rally — identical for both rows. */}
      <text x={x0 - 14} y="62" fontSize="12" fill={UNMARKED} textAnchor="end">
        rally won by
      </text>
      {RALLIES.map((serverWon, i) => (
        <g key={i} className="fade-on-reveal" style={{ ['--draw-delay' as string]: `${i * 35}ms` }}>
          <text
            x={at(i)} y="62" fontSize="12" fill={CHALK} fillOpacity="0.75" textAnchor="middle"
          >
            {serverWon ? 'S' : 'R'}
          </text>
        </g>
      ))}

      {/* ------------------------------------------------ before: side-out */}
      <text x={x0 - 14} y="112" fontSize="12" fill={UNMARKED} textAnchor="end">
        to 2006
      </text>
      <line x1={x0 - 8} x2={at(15) + 8} y1="128" y2="128" stroke={CHALK} strokeOpacity="0.35" />
      {RALLIES.map((serverWon, i) => (
        <g key={i} className="fade-on-reveal" style={{ ['--draw-delay' as string]: `${250 + i * 35}ms` }}>
          {serverWon ? (
            <rect x={at(i) - 6} y="100" width="12" height="12" fill={CHALK} />
          ) : (
            // No point, and therefore no number: the rally happened and left
            // nothing behind in the record.
            <circle cx={at(i)} cy="106" r="5.5" fill="none" stroke={UNMARKED} strokeWidth="1.5" />
          )}
        </g>
      ))}
      <text
        x={at(15) + 24} y="112" className="numeral" fontSize="17" fill={CHALK}
      >
        {sideOut}
      </text>
      <text x={at(15) + 24} y="130" fontSize="11" fill={UNMARKED}>
        points
      </text>

      {/* -------------------------------------------------- after: rally */}
      <text x={x0 - 14} y="188" fontSize="12" fill={UNMARKED} textAnchor="end">
        from 2006
      </text>
      <line x1={x0 - 8} x2={at(15) + 8} y1="204" y2="204" stroke={CHALK} strokeOpacity="0.35" />
      {RALLIES.map((_, i) => (
        <g key={i} className="fade-on-reveal" style={{ ['--draw-delay' as string]: `${600 + i * 35}ms` }}>
          <rect x={at(i) - 6} y="176" width="12" height="12" fill={CLAY} />
        </g>
      ))}
      <text x={at(15) + 24} y="188" className="numeral" fontSize="17" fill={CLAY}>
        {RALLIES.length}
      </text>
      <text x={at(15) + 24} y="206" fontSize="11" fill={UNMARKED}>
        points
      </text>

      <text x={x0 - 14} y="234" fontSize="11" fill={UNMARKED}>
        S — serving side won the rally · R — receiving side won it
      </text>
    </svg>
  )
}
