const CHALK = '#F2F5F1'
const GOLD = '#F2C94F'
const UNMARKED = '#7A8C8A'

/**
 * Why gymnastics gets no chart.
 *
 * Two rulers, drawn deliberately unlike each other: one bounded and capped at
 * 10.0, one open at the top with no maximum to draw. They are given different
 * baselines and different spacings on purpose — the same rule the series
 * charts obey — because putting them on one baseline would be the exact claim
 * this page exists to refuse. A 9.85 does not sit below a 15.633. It sits
 * outside it.
 */
export default function ScoreScales() {
  const oldX = 210
  const oldBase = 330
  const oldPerPoint = 21 // 0 to 10 across 210px

  const newX = 505
  const newBase = 316
  const newPerPoint = 13 // a different ruler, and drawn as one

  const oldY = (v: number) => oldBase - v * oldPerPoint
  const newY = (v: number) => newBase - v * newPerPoint

  return (
    <svg
      viewBox="0 0 760 372"
      role="img"
      aria-label="Two scales side by side. To 2005 a routine was scored against a maximum of 10.0, drawn as a ruler with a solid ceiling. From 2006 the score is an open-ended difficulty value added to an execution mark out of 10, drawn as a ruler that runs off the top with no maximum. The two are given different baselines and different spacings because no conversion between them exists."
      className="w-full"
    >
      {/* ------------------------------------------------------- to 2005 */}
      <text x={oldX - 44} y="26" className="numeral" fontSize="13" fill={CHALK} fillOpacity="0.55">
        TO 2005
      </text>

      <line
        x1={oldX} x2={oldX} y1={oldBase} y2={oldY(10)}
        stroke={CHALK} strokeWidth="2" strokeOpacity="0.8"
        className="draw-on-reveal" style={{ ['--path-length' as string]: '215' }}
      />
      {[0, 2, 4, 6, 8].map((v) => (
        <g key={v} className="fade-on-reveal" style={{ ['--draw-delay' as string]: `${300 + v * 20}ms` }}>
          <line x1={oldX - 6} x2={oldX + 6} y1={oldY(v)} y2={oldY(v)} stroke={CHALK} strokeOpacity="0.5" />
          <text
            x={oldX - 12} y={oldY(v) + 4} className="numeral" fontSize="12"
            fill={CHALK} fillOpacity="0.55" textAnchor="end"
          >
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* The ceiling. A real one, which is what made the number legible. */}
      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '620ms' }}>
        <line x1={oldX - 34} x2={oldX + 60} y1={oldY(10)} y2={oldY(10)} stroke={GOLD} strokeWidth="3" />
        <text x={oldX + 68} y={oldY(10) + 4} fontSize="12.5" fill={GOLD}>
          10.0 — the top of the scale
        </text>
        <circle cx={oldX} cy={oldY(9.85)} r="4" fill={CHALK} />
        <text x={oldX + 12} y={oldY(9.85) + 26} fontSize="12" fill={CHALK} fillOpacity="0.75">
          9.85
        </text>
      </g>

      {/* --------------------------------------------- the gap between them */}
      <defs>
        <pattern id="scale-gap" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke={CHALK} strokeOpacity="0.14" strokeWidth="2" />
        </pattern>
      </defs>
      <rect x="330" y="46" width="80" height="296" fill="url(#scale-gap)" />
      <line x1="330" y1="46" x2="330" y2="342" stroke={CHALK} strokeOpacity="0.35" strokeDasharray="4 5" />
      <line x1="410" y1="46" x2="410" y2="342" stroke={CHALK} strokeOpacity="0.35" strokeDasharray="4 5" />
      <text x="370" y="362" fontSize="11" fill={UNMARKED} textAnchor="middle" letterSpacing="0.1em">
        NO CONVERSION
      </text>

      {/* ------------------------------------------------------ from 2006 */}
      <text x={newX - 44} y="26" className="numeral" fontSize="13" fill={CHALK} fillOpacity="0.55">
        FROM 2006
      </text>

      <line
        x1={newX} x2={newX} y1={newBase} y2={newY(17)}
        stroke={CHALK} strokeWidth="2" strokeOpacity="0.8"
        className="draw-on-reveal" style={{ ['--path-length' as string]: '225', ['--draw-delay' as string]: '200ms' }}
      />
      {[0, 5, 10, 15].map((v) => (
        <g key={v} className="fade-on-reveal" style={{ ['--draw-delay' as string]: `${500 + v * 14}ms` }}>
          <line x1={newX - 6} x2={newX + 6} y1={newY(v)} y2={newY(v)} stroke={CHALK} strokeOpacity="0.5" />
          <text
            x={newX - 12} y={newY(v) + 4} className="numeral" fontSize="12"
            fill={CHALK} fillOpacity="0.55" textAnchor="end"
          >
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* No cap to draw, so the ruler leaves the frame. */}
      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '760ms' }}>
        <path
          d={`M${newX},${newY(17)} L${newX},${newY(19.4)} M${newX - 6},${newY(18.9)} L${newX},${newY(19.6)} L${newX + 6},${newY(18.9)}`}
          stroke={GOLD} strokeWidth="2" fill="none"
        />
        <text x={newX - 14} y={newY(19)} fontSize="12.5" fill={GOLD} textAnchor="end">
          no maximum
        </text>
        <circle cx={newX} cy={newY(15.633)} r="4" fill={CHALK} />
        <text
          x={newX - 14} y={newY(15.633) + 4} fontSize="12"
          fill={CHALK} fillOpacity="0.75" textAnchor="end"
        >
          15.633
        </text>
      </g>

      {/* What the modern number is made of. */}
      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '900ms' }}>
        <path
          d={`M${newX + 26},${newY(0)} h10 V${newY(10)} h-10`}
          stroke={CHALK} strokeOpacity="0.4" fill="none"
        />
        <text x={newX + 44} y={newY(5) + 4} fontSize="11.5" fill={UNMARKED}>
          execution, out of 10
        </text>
        <path
          d={`M${newX + 26},${newY(10)} h10 V${newY(17)} h-10`}
          stroke={GOLD} strokeOpacity="0.55" fill="none"
        />
        <text x={newX + 44} y={newY(13.5) + 4} fontSize="11.5" fill={UNMARKED}>
          difficulty, unbounded
        </text>
      </g>
    </svg>
  )
}
