/**
 * A sport's pictogram: chalk line-work on a tile of the family colour, which
 * is the site's one visual idea (DESIGN.md) at the size of a thumbnail. Drawn
 * here rather than sourced, so it carries no credit and can be read at 28px.
 *
 * Each drawing is of the thing the sport is built around rather than of an
 * athlete — the implement, the aircraft, the court — because that is what a
 * rulebook governs. A sport with no drawing yet renders nothing, not a
 * placeholder: an empty tile would read as an icon that failed to load.
 */

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

/** 64-unit drawings, stroked in chalk. Fills are the tile showing through. */
const DRAWINGS: Record<string, React.ReactNode> = {
  // A sailplane from above. The span is most of the tile on purpose: the
  // wing is what the equipment classes are defined by.
  'air-sports': (
    <>
      <path d="M5 27.2 L29.6 25.4 L34.4 25.4 L59 27.2 L59 28.8 L34.4 30.2 L29.6 30.2 L5 28.8 Z" />
      <path d="M32 13.5 C33.9 13.5 34.5 17 34.5 21.5 L33 50.5 L31 50.5 L29.5 21.5 C29.5 17 30.1 13.5 32 13.5 Z" />
      <path d="M24.5 49.2 L39.5 49.2 L39.5 51.8 L24.5 51.8 Z" />
      <path d="M30.6 18.6 C31.4 17.6 32.6 17.6 33.4 18.6" fill="none" />
    </>
  ),
  // A target face, with one arrow in the ten. The rings are evenly spaced,
  // as they are on the real face, because the sport is the rings.
  archery: (
    <>
      <circle cx="30" cy="34" r="21" />
      <circle cx="30" cy="34" r="15.5" fill="none" />
      <circle cx="30" cy="34" r="10" fill="none" />
      <circle cx="30" cy="34" r="4.5" fill="none" />
      <path d="M31 33 L54 10" fill="none" />
      <path d="M50.5 9.5 L54 10 L54.5 13.5 M47.5 12.5 L51 13 L51.5 16.5" fill="none" />
    </>
  ),
  // The track from above: two lanes round the oval and the finish line
  // across them. Every event in the sport happens inside or on this shape.
  athletics: (
    <>
      <rect x="6" y="17" width="52" height="30" rx="15" />
      <rect x="11.5" y="22.5" width="41" height="19" rx="9.5" fill="none" />
      <rect x="17" y="28" width="30" height="8" rx="4" fill="none" />
      <path d="M40 36 L40 47" fill="none" />
    </>
  ),
  // A feathered shuttle: the cork, the skirt, the thread binding the
  // feathers. The one piece of kit the sport declined to modernise.
  badminton: (
    <>
      <path d="M25.5 43 L14 11 L50 11 L38.5 43 Z" />
      <path d="M28.5 43 L23 11 M32 43 L32 11 M35.5 43 L41 11 M18.5 23.5 L45.5 23.5" fill="none" />
      <path d="M24.5 43 L39.5 43 L39.5 46 A7.5 7.5 0 0 1 24.5 46 Z" />
    </>
  ),
  // The diamond: ninety feet a side, the mound short of its centre, and
  // the foul lines running on past first and third.
  baseball: (
    <>
      <path d="M32 55 L53 34 L32 13 L11 34 Z" />
      <path d="M53 34 L61 26 M11 34 L3 26" fill="none" />
      <circle cx="32" cy="36" r="3.2" fill="none" />
      <path d="M53 31 L56 34 L53 37 L50 34 Z M32 10 L35 13 L32 16 L29 13 Z M11 31 L14 34 L11 37 L8 34 Z" fill="#F2F5F1" stroke="none" />
      <path d="M29.5 52.5 L34.5 52.5 L34.5 55 L32 57.5 L29.5 55 Z" fill="#F2F5F1" stroke="none" />
    </>
  ),
  // Backboard, rim and net from the front: the one specification that has
  // not moved since 1891.
  basketball: (
    <>
      <rect x="12" y="9" width="40" height="27" rx="1" />
      <rect x="25" y="21" width="14" height="11" fill="none" />
      <ellipse cx="32" cy="37" rx="9" ry="2.4" fill="none" />
      <path d="M23 37 L27 52 M41 37 L37 52 M28.5 38.5 L30 52 M35.5 38.5 L34 52 M24.5 43 L39.5 43 M26 48 L38 48" fill="none" />
    </>
  ),
}

export function hasSportIcon(sport: string): boolean {
  return sport in DRAWINGS
}

export default function SportIcon({
  sport,
  colour = 'unmarked',
  className = 'h-12 w-12',
}: {
  sport: string
  colour?: string
  className?: string
}) {
  const drawing = DRAWINGS[sport]
  if (!drawing) return null
  const c = COLOUR[colour] ?? COLOUR.unmarked
  return (
    <svg
      viewBox="0 0 64 64"
      className={`shrink-0 ${className}`}
      aria-hidden
      focusable="false"
    >
      <rect x="0.5" y="0.5" width="63" height="63" fill={c.base} fillOpacity="0.32" stroke={c.bright} strokeOpacity="0.55" />
      <g
        fill={c.base}
        fillOpacity="0.5"
        stroke="#F2F5F1"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {drawing}
      </g>
    </svg>
  )
}
