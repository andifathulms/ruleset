const CHALK = '#F2F5F1'
const CLAY = '#EA7E4E'
const UNMARKED = '#9FB2B0'

/**
 * The court, drawn twice, because it is two courts painted on one floor.
 *
 * Every line is placed from the measurement in the laws at one scale, so the
 * proportions are the real ones: 13.4 m by 6.1 m, the net across the middle,
 * the short service line 1.98 m from it, the side tramlines 0.46 m wide and
 * the back tramline 0.76 m deep. The pale area is where the shuttle may land
 * during a rally; the solid area is where a serve must land.
 *
 * Two drawings rather than one wide one, so that on a phone they stack and
 * the labels stay readable.
 */

const M = 26 // pixels per metre
const X0 = 26
const Y0 = 58
const LENGTH = 13.4
const WIDTH = 6.1
const SIDE = 0.46 // side tramline
const BACK = 0.76 // back tramline
const SHORT = 1.98 // short service line, from the net

const x = (m: number) => X0 + m * M
const y = (m: number) => Y0 + m * M
const NET = LENGTH / 2

function Court({ doubles }: { doubles: boolean }) {
  // In play during a rally.
  const playTop = doubles ? 0 : SIDE
  const playBottom = doubles ? WIDTH : WIDTH - SIDE
  // Where the serve must land: the receiver's right-hand court, drawn at the
  // top right because the receiver faces left.
  const serveFar = doubles ? LENGTH - BACK : LENGTH
  const serveTop = doubles ? 0 : SIDE

  const name = doubles ? 'Doubles' : 'Singles'
  const shape = doubles ? 'short and wide' : 'long and narrow'

  return (
    <svg
      viewBox="0 0 400 258"
      role="img"
      aria-label={
        doubles
          ? 'The doubles court. In a rally the whole 13.4 by 6.1 metre court is in. The serve must land in the diagonally opposite service court, which runs the full width to the outer side line but stops at the inner back line, 0.76 metres short of the back boundary.'
          : 'The singles court. In a rally the court is the full 13.4 metres long but only 5.18 metres wide, inside the inner side lines. The serve must land in the diagonally opposite service court, which runs to the back boundary.'
      }
      className="w-full"
    >
      <text x={X0} y="18" className="numeral" fontSize="17" fill={CHALK}>
        {name}
      </text>
      <text x={X0 + (doubles ? 66 : 58)} y="18" fontSize="12.5" fill={UNMARKED}>
        the serve lands {shape}
      </text>

      {/* In play during a rally. */}
      <rect
        x={x(0)} y={y(playTop)} width={LENGTH * M} height={(playBottom - playTop) * M}
        fill={CLAY} fillOpacity="0.14"
      />
      {/* Where the serve must land. */}
      <rect
        x={x(NET + SHORT)} y={y(serveTop)}
        width={(serveFar - NET - SHORT) * M} height={(WIDTH / 2 - serveTop) * M}
        fill={CLAY} fillOpacity="0.8"
      />

      {/* The lines, all of them, on both drawings: the floor is the same. */}
      <g stroke={CHALK} strokeWidth="1.5" fill="none">
        <rect x={x(0)} y={y(0)} width={LENGTH * M} height={WIDTH * M} />
        <line x1={x(0)} x2={x(LENGTH)} y1={y(SIDE)} y2={y(SIDE)} />
        <line x1={x(0)} x2={x(LENGTH)} y1={y(WIDTH - SIDE)} y2={y(WIDTH - SIDE)} />
        <line x1={x(BACK)} x2={x(BACK)} y1={y(0)} y2={y(WIDTH)} />
        <line x1={x(LENGTH - BACK)} x2={x(LENGTH - BACK)} y1={y(0)} y2={y(WIDTH)} />
        <line x1={x(NET - SHORT)} x2={x(NET - SHORT)} y1={y(0)} y2={y(WIDTH)} />
        <line x1={x(NET + SHORT)} x2={x(NET + SHORT)} y1={y(0)} y2={y(WIDTH)} />
        <line x1={x(0)} x2={x(NET - SHORT)} y1={y(WIDTH / 2)} y2={y(WIDTH / 2)} />
        <line x1={x(NET + SHORT)} x2={x(LENGTH)} y1={y(WIDTH / 2)} y2={y(WIDTH / 2)} />
      </g>
      {/* The net. */}
      <line
        x1={x(NET)} x2={x(NET)} y1={y(0) - 7} y2={y(WIDTH) + 7}
        stroke={CHALK} strokeWidth="3"
      />
      <text x={x(NET)} y={y(0) - 12} fontSize="11.5" fill={UNMARKED} textAnchor="middle">
        net
      </text>

      {/* The server, in their own right-hand court, and the serve's diagonal. */}
      <circle cx={x(NET - SHORT - 0.9)} cy={y(WIDTH / 2 + 0.75)} r="5" fill={CHALK} />
      <line
        x1={x(NET - SHORT - 0.9) + 8} y1={y(WIDTH / 2 + 0.75) - 4}
        x2={x(NET + SHORT + 1.5)} y2={y(WIDTH / 2 - 1.2)}
        stroke={CHALK} strokeWidth="1.5" strokeDasharray="5 4"
      />
      <path
        d={`M${x(NET + SHORT + 1.5)} ${y(WIDTH / 2 - 1.2)} l-9 -1 l3.5 7.5 z`}
        fill={CHALK}
      />
      <text x={x(NET - SHORT - 0.9)} y={y(WIDTH / 2 + 0.75) + 19} fontSize="11.5" fill={CHALK} textAnchor="middle">
        server
      </text>

      {/* Measurements, on the first drawing only: they are the same floor. */}
      {!doubles && (
        <>
          <text x={x(NET)} y={y(WIDTH) + 30} className="numeral" fontSize="13" fill={CHALK} textAnchor="middle">
            13.4 m
          </text>
          <line x1={x(0)} x2={x(NET) - 30} y1={y(WIDTH) + 26} y2={y(WIDTH) + 26} stroke={UNMARKED} />
          <line x1={x(NET) + 30} x2={x(LENGTH)} y1={y(WIDTH) + 26} y2={y(WIDTH) + 26} stroke={UNMARKED} />
        </>
      )}
      <text x={x(LENGTH) + 6} y={y(WIDTH / 2) + 4} className="numeral" fontSize="12" fill={CHALK}>
        {doubles ? '6.1' : '5.18'}
      </text>
    </svg>
  )
}

export default function BadmintonCourt() {
  return (
    <div>
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
        <Court doubles={false} />
        <Court doubles />
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13.5px] text-chalk/80">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-5" style={{ background: CLAY, opacity: 0.8 }} />
          where the serve must land
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-5 border border-chalk/30" style={{ background: `${CLAY}24` }} />
          in during a rally
        </li>
        <li className="text-unmarked">widths in metres</li>
      </ul>
    </div>
  )
}
