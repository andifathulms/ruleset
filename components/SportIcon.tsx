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
