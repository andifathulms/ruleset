const CHALK = '#F2F5F1'
const CLAY = '#EA7E4E'
const POOL = '#57ACE8'

/**
 * What the 1986 rule actually changed: the balance point of the implement,
 * moved four centimetres towards the tip.
 *
 * Drawn to scale, which is the point — four centimetres on a 2.6 metre shaft
 * is a shift you have to be told to look for, and it took roughly ten per cent
 * off the world record. Nothing here is a time series and nothing is measured
 * off a shared axis; it is a drawing of an object and of two flight paths.
 */
export default function JavelinCentreOfGravity() {
  // 2.60 m of shaft across 560 px, so a centimetre is 2.15 px and the four
  // centimetres are drawn at their true size rather than exaggerated.
  const x0 = 80
  const perMetre = 560 / 2.6
  const at = (m: number) => x0 + m * perMetre
  const cogBefore = at(0.95)
  const cogAfter = at(0.91)

  return (
    <svg
      viewBox="0 0 760 330"
      role="img"
      aria-label="The javelin drawn to scale. The balance point moved four centimetres towards the tip in 1986, a shift of about one and a half per cent of the shaft. Below, two flight paths: before the change the implement tended to land flat and far; after it, the nose drops earlier and the throw lands shorter and point-first."
      className="w-full"
    >
      {/* ---------------------------------------------------------- the shaft */}
      <text x={x0} y="26" className="numeral" fontSize="13" fill={CHALK} fillOpacity="0.55">
        THE IMPLEMENT, TO SCALE
      </text>

      {/* Tip at the left, tail at the right. */}
      <path
        d={`M${x0},58 L${x0 + 22},52 L${at(2.6)},52 L${at(2.6)},64 L${x0 + 22},64 Z`}
        fill={CHALK}
        fillOpacity="0.13"
        stroke={CHALK}
        strokeOpacity="0.75"
        strokeWidth="1.5"
        className="draw-on-reveal"
        style={{ ['--path-length' as string]: '1300' }}
      />
      {/* The grip, which is where the shift is felt. */}
      <rect x={at(0.85)} y="52" width={perMetre * 0.16} height="12" fill={CHALK} fillOpacity="0.3" />

      {/* The two balance points. Eight pixels apart, because that is what four
          centimetres is at this scale — so they are separated above and below
          the shaft instead, or they read as one mark with two stems. */}
      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '700ms' }}>
        <line x1={cogBefore} x2={cogBefore} y1="30" y2="58" stroke={POOL} strokeWidth="1.5" />
        <path d={`M${cogBefore},58 l5,-9 l-10,0 Z`} fill={POOL} />
        <text x={cogBefore + 12} y="30" fontSize="12.5" fill={POOL}>
          balance point to 1985
        </text>

        <line x1={cogAfter} x2={cogAfter} y1="58" y2="88" stroke={CLAY} strokeWidth="1.5" />
        <path d={`M${cogAfter},58 l5,9 l-10,0 Z`} fill={CLAY} />
        <text x={cogAfter - 12} y="92" fontSize="12.5" fill={CLAY} textAnchor="end">
          and from 1986
        </text>
      </g>

      {/* The shift itself, measured between the two marks rather than parked
          somewhere below them. */}
      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '850ms' }}>
        <line x1={cogAfter} x2={cogBefore} y1="112" y2="112" stroke={CHALK} strokeOpacity="0.7" />
        <line x1={cogAfter} x2={cogAfter} y1="106" y2="118" stroke={CHALK} strokeOpacity="0.7" />
        <line x1={cogBefore} x2={cogBefore} y1="106" y2="118" stroke={CHALK} strokeOpacity="0.7" />
        <line x1={cogAfter} x2={cogAfter} y1="88" y2="106" stroke={CHALK} strokeOpacity="0.2" strokeDasharray="2 3" />
        <line x1={cogBefore} x2={cogBefore} y1="64" y2="106" stroke={CHALK} strokeOpacity="0.2" strokeDasharray="2 3" />
        <text x={cogBefore + 14} y="116" className="numeral" fontSize="13" fill={CHALK}>
          4 cm
        </text>
      </g>

      {/* Overall length, for the comparison that makes the point. */}
      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '950ms' }}>
        <line x1={x0} x2={at(2.6)} y1="140" y2="140" stroke={CHALK} strokeOpacity="0.28" />
        <line x1={x0} x2={x0} y1="134" y2="146" stroke={CHALK} strokeOpacity="0.28" />
        <line x1={at(2.6)} x2={at(2.6)} y1="134" y2="146" stroke={CHALK} strokeOpacity="0.28" />
        <text
          x={(x0 + at(2.6)) / 2} y="157" className="numeral" fontSize="12"
          fill={CHALK} fillOpacity="0.5" textAnchor="middle"
        >
          2.60 m of shaft
        </text>
      </g>

      {/* --------------------------------------------------- the consequence */}
      <text x={x0} y="204" className="numeral" fontSize="13" fill={CHALK} fillOpacity="0.55">
        WHAT IT DID TO THE FLIGHT
      </text>

      <line x1={x0} x2="620" y1="300" y2="300" stroke={CHALK} strokeOpacity="0.3" />

      {/* Before: carries further and comes down shallow, which is what made
          flat landings a judging argument in the first place. */}
      <path
        d={`M${x0},300 C 190,214 330,214 560,294`}
        fill="none" stroke={POOL} strokeWidth="2"
        className="draw-on-reveal"
        style={{ ['--path-length' as string]: '580', ['--draw-delay' as string]: '250ms' }}
      />
      {/* After: the nose drops earlier, so it lands closer and point-first. */}
      <path
        d={`M${x0},300 C 180,224 290,232 430,298`}
        fill="none" stroke={CLAY} strokeWidth="2"
        className="draw-on-reveal"
        style={{ ['--path-length' as string]: '440', ['--draw-delay' as string]: '450ms' }}
      />

      <g className="fade-on-reveal" style={{ ['--draw-delay' as string]: '1100ms' }}>
        {/* Landing attitude, drawn as the angle the shaft makes with the ground. */}
        <line x1="540" y1="282" x2="572" y2="299" stroke={POOL} strokeWidth="2.5" />
        <text x="580" y="292" fontSize="12" fill={POOL}>
          shallow, and argued over
        </text>

        <line x1="414" y1="272" x2="436" y2="299" stroke={CLAY} strokeWidth="2.5" />
        <line x1="404" y1="286" x2="416" y2="278" stroke={CLAY} strokeOpacity="0.5" />
        <text x="398" y="292" fontSize="12" fill={CLAY} textAnchor="end">
          point first, and shorter
        </text>
      </g>
    </svg>
  )
}
