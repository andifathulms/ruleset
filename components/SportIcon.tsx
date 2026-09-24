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
  // The village fronton: a high wall with the curved Basque gable, the low
  // line a ball must clear, and the ball. The wall is why the game survived.
  'basque-pelota': (
    <>
      <path d="M8 50 L8 31 L17 31 L17 24 L25 24 Q32 10 39 24 L47 24 L47 31 L56 31 L56 50 Z" />
      <path d="M8 44 L56 44 M3 50 L61 50" fill="none" />
      <circle cx="42" cy="38" r="2.4" fill="#F2F5F1" stroke="none" />
    </>
  ),
  // A table from above, three balls and a cue: the carom game, which is the
  // one code with no pockets to draw.
  billiards: (
    <>
      <rect x="6" y="15" width="52" height="30" rx="2.5" />
      <rect x="10" y="19" width="44" height="22" fill="none" />
      <circle cx="24" cy="27" r="2.4" fill="#F2F5F1" stroke="none" />
      <circle cx="38" cy="33" r="2.4" fill="none" />
      <circle cx="44" cy="25" r="2.4" fill="#F2F5F1" stroke="none" />
      <path d="M21 29.5 L6 54" fill="none" strokeWidth="2.2" />
    </>
  ),
  // A board with chequered squares, as chess plays it, and two stones on the
  // intersections, as go and xiangqi do: the distinction the laws turn on.
  'board-games': (
    <>
      <rect x="10" y="10" width="44" height="44" />
      <path d="M10 21 H54 M10 32 H54 M10 43 H54 M21 10 V54 M32 10 V54 M43 10 V54" fill="none" />
      <path d="M10 10 h11 v11 h-11 Z M32 10 h11 v11 h-11 Z M21 21 h11 v11 h-11 Z M43 21 h11 v11 h-11 Z M10 32 h11 v11 h-11 Z M32 32 h11 v11 h-11 Z M21 43 h11 v11 h-11 Z M43 43 h11 v11 h-11 Z" fill="#F2F5F1" fillOpacity="0.28" stroke="none" />
      <circle cx="32" cy="32" r="4.2" fill="#F2F5F1" />
      <circle cx="43" cy="21" r="4.2" fill="#05161A" />
    </>
  ),
  // Two steel boules and the jack on rough ground: the only target in sport
  // that the play itself moves.
  boules: (
    <>
      <path d="M4 48 H60" fill="none" />
      <circle cx="20" cy="36" r="11" />
      <circle cx="44" cy="39" r="8.6" />
      <path d="M13.5 31 A8 8 0 0 1 20 27 M39 35 A6 6 0 0 1 44 32" fill="none" />
      <circle cx="33" cy="45.5" r="2.5" fill="#F2F5F1" stroke="none" />
    </>
  ),
  // Three pins and a ball on the lane. The oil, the part that decides the
  // sport, is exactly the part that cannot be drawn.
  bowling: (
    <>
      <path d="M4 52 H60" fill="none" />
      <path d="M36 52 C34 46 35.5 41 37.5 37 C36.2 34 36.8 30 39 30 C41.2 30 41.8 34 40.5 37 C42.5 41 44 46 42 52 Z" />
      <path d="M44 52 C42 45 43.5 39 45.5 35 C44.2 32 44.8 28 47 28 C49.2 28 49.8 32 48.5 35 C50.5 39 52 45 50 52 Z" />
      <path d="M52 52 C50 46 51.5 41 53.5 37 C52.2 34 52.8 30 55 30 C57.2 30 57.8 34 56.5 37 C58.5 41 60 46 58 52 Z" />
      <circle cx="18" cy="42" r="10" />
      <circle cx="15" cy="37.5" r="1.4" fill="#F2F5F1" stroke="none" />
      <circle cx="20" cy="36.5" r="1.4" fill="#F2F5F1" stroke="none" />
      <circle cx="17" cy="42" r="1.6" fill="#F2F5F1" stroke="none" />
    </>
  ),
  // A glove: made compulsory in 1867 to protect people, and argued about
  // ever since for what it lets them do to each other.
  boxing: (
    <>
      <path d="M22 40 C19 26 27 12 40 13 C51 14 55 25 52 36 C50 43 45 46 38 46 L27 46 C24 46 22.5 43.5 22 40 Z" />
      <path d="M23.5 38 C16.5 38 14.5 30 18.5 26.5 C22 23.5 27 26 27.5 31 C28 34.5 26.5 37.5 23.5 38 Z" />
      <rect x="25" y="46" width="21" height="9" rx="1.5" />
      <path d="M32 46 L32 55 M39 46 L39 55" fill="none" />
    </>
  ),
  // A record on the turntable and the tonearm: the form is named for the
  // break of a record, and the music is the one thing nobody controls.
  breaking: (
    <>
      <circle cx="28" cy="34" r="20" />
      <circle cx="28" cy="34" r="14" fill="none" />
      <circle cx="28" cy="34" r="6" fill="none" />
      <circle cx="28" cy="34" r="1.6" fill="#F2F5F1" stroke="none" />
      <path d="M55 9 L55 30 L42 44" fill="none" strokeWidth="2" />
      <circle cx="55" cy="9" r="2.6" />
    </>
  ),
  // Two cards fanned, a spade on the front one: thirteen of these each, and
  // nothing else a player may use to say anything.
  bridge: (
    <>
      <rect x="12" y="14" width="24" height="34" rx="2.5" transform="rotate(-14 24 31)" />
      <rect x="26" y="14" width="24" height="34" rx="2.5" transform="rotate(10 38 31)" />
      <path d="M38.5 22 C35 26.5 31.5 29 31.5 32 C31.5 34.5 34.5 35.8 37 33.8 L36 38.5 L41 38.5 L40 33.8 C42.5 35.8 45.5 34.5 45.5 32 C45.5 29 42 26.5 38.5 22 Z" fill="#F2F5F1" stroke="none" transform="rotate(10 38 31)" />
    </>
  ),
  // A kayak from the side: the paddler seated, the double blade. The canoe
  // is the kneeling, single-bladed other half of the sport.
  canoeing: (
    <>
      <path d="M4 40 C14 45 50 45 60 40 C50 37 14 37 4 40 Z" />
      <circle cx="32" cy="24" r="3.4" />
      <path d="M32 27.5 L32 37" fill="none" />
      <path d="M18 44 L46 20" fill="none" strokeWidth="1.8" />
      <path d="M14.5 44.5 L18 44 L19.5 48 M46 20 L49.5 19.5 L48 16" fill="#F2F5F1" />
      <path d="M2 50 C8 48 12 52 18 50 S28 48 34 50 S46 52 52 50 S60 48 62 50" fill="none" strokeOpacity="0.6" />
    </>
  ),
  // A megaphone: the whole of the activity's equipment in 1898, before it
  // became a sport of its own.
  cheerleading: (
    <>
      <path d="M12 28 L44 14 L44 50 L12 36 Z" />
      <ellipse cx="44" cy="32" rx="4.5" ry="18" />
      <rect x="7" y="27" width="6" height="10" rx="1.5" />
      <path d="M22 35 L20 46 L26 46 L28 38" fill="none" />
      <path d="M52 22 L58 18 M53.5 32 L60 32 M52 42 L58 46" fill="none" strokeOpacity="0.7" />
    </>
  ),
  // The wicket: three stumps, two bails, and the ball. It has had three
  // stumps since the 1770s; the curved bat of 1743 faced two.
  cricket: (
    <>
      <path d="M22 16 L22 54 M32 16 L32 54 M42 16 L42 54" fill="none" strokeWidth="2.4" />
      <path d="M21 13 L32 13 M32 13 L43 13" fill="none" strokeWidth="2" />
      <path d="M14 54 H50" fill="none" />
      <circle cx="52" cy="40" r="5" />
      <path d="M48.5 37 C50.5 39 50.5 41 48.5 43.5 M55.5 36.5 C53.5 39 53.5 41 55.5 43.5" fill="none" strokeWidth="1.1" />
    </>
  ),  // A hoop, a ball just short of it, and a mallet. At championship level the
  // hoop clears the ball by a fraction of a millimetre, which is the sport.
  croquet: (
    <>
      <path d="M4 50 H60" fill="none" />
      <path d="M16 50 L16 30 A8 8 0 0 1 32 30 L32 50" fill="none" strokeWidth="2.2" />
      <circle cx="40" cy="45" r="5" />
      <rect x="44" y="40" width="16" height="7" rx="1.5" transform="rotate(-8 52 43.5)" />
      <path d="M52 40 L58 10" fill="none" strokeWidth="2" />
    </>
  ),  // A bicycle as the Lugano Charter defines one: two wheels and a frame made
  // of two triangles of tubes. Everything else in the rulebook is its edges.
  cycling: (
    <>
      <circle cx="16" cy="40" r="11" />
      <circle cx="48" cy="40" r="11" />
      <path d="M16 40 L28 40 L41 24 L24 24 Z M28 40 L22 18 M41 24 L48 40" fill="none" strokeWidth="1.8" />
      <path d="M18 18 L26 18 M38 19 L43 17 L45 21" fill="none" strokeWidth="1.8" />
      <circle cx="28" cy="40" r="2" fill="#F2F5F1" stroke="none" />
    </>
  ),  // A couple in closed hold, the woman's skirt swinging: the competitive unit
  // is two people, and the Standard programme never lets go.
  dancesport: (
    <>
      <circle cx="25" cy="13" r="4" />
      <circle cx="39" cy="15" r="4" />
      <path d="M25 17 L25 36 M25 36 L21 54 M25 36 L30 54" fill="none" />
      <path d="M25 23 L32 20 L39 24 M25 23 L17 16" fill="none" />
      <path d="M39 19 L37 34 L50 50 C44 52 34 52 28 49 Z" />
    </>
  ),  // A dragon boat: the required head at the bow, a row of paddles, and the
  // drum a crew member beats without propelling anything.
  'dragon-boat': (
    <>
      <path d="M6 40 L50 40 C53 40 55 37 54 34 L58 30 L55 28 L52 31 C50 30 48 32 49 34 L10 34 C7 34 5 36 6 40 Z" />
      <path d="M16 34 L12 48 M24 34 L20 48 M32 34 L28 48 M40 34 L36 48" fill="none" />
      <circle cx="45" cy="29.5" r="3.5" />
      <path d="M2 50 C8 48 12 52 18 50 S28 48 34 50 S46 52 52 50 S60 48 62 50" fill="none" strokeOpacity="0.6" />
    </>
  ),  // Run, bike, run: a shoe, a wheel, a shoe, joined by the arrow of the
  // sequence. The second shoe is the one the sport is decided on.
  duathlon: (
    <>
      <path d="M4 30 L12 30 L14 34 L20 36 L20 40 L4 40 Z" />
      <circle cx="32" cy="35" r="9" />
      <path d="M32 26 L32 44 M23 35 L41 35" fill="none" strokeOpacity="0.6" />
      <path d="M44 30 L52 30 L54 34 L60 36 L60 40 L44 40 Z" fill="#F2F5F1" fillOpacity="0.55" />
      <path d="M8 22 H56 M52 18 L56 22 L52 26" fill="none" />
    </>
  ),  // A horse's head in profile with its bridle: the competitor that cannot
  // complain, and the reason the equipment rules are welfare rules.
  equestrian: (
    <>
      <path d="M22 56 L24 34 C24 22 30 12 38 9 L40 4 L43 10 C49 14 56 26 58 34 C59 38 56 41 52 39 L44 33 C42 40 40 48 40 56 Z" />
      <path d="M38 9 C33 16 30 24 30 34" fill="none" strokeOpacity="0.6" />
      <path d="M44 33 L51 20 M44 22 L54 30" fill="none" />
      <circle cx="46" cy="19" r="1.4" fill="#F2F5F1" stroke="none" />
    </>
  ),  // A controller: the one piece of equipment a competitor brings. The field
  // of play is software, and belongs to someone else.
  esports: (
    <>
      <path d="M20 22 L44 22 C52 22 57 30 58 40 C59 47 54 50 50 46 L44 40 L20 40 L14 46 C10 50 5 47 6 40 C7 30 12 22 20 22 Z" />
      <path d="M17 31 H25 M21 27 V35" fill="none" strokeWidth="2" />
      <circle cx="42" cy="29" r="2" fill="#F2F5F1" stroke="none" />
      <circle cx="47" cy="33" r="2" fill="#F2F5F1" stroke="none" />
    </>
  ),
  // Two foils crossed at the blade, bell guards and grips below.
  fencing: (
    <>
      <path d="M12 12 L44 44 M52 12 L20 44" />
      <path d="M40 40 Q44 50 50 46 Q54 40 44 40 Z" />
      <path d="M24 40 Q20 50 14 46 Q10 40 20 40 Z" />
      <path d="M47 47 L54 54 M17 47 L10 54" />
    </>
  ),
  // A monofin, blade down: two foot pockets over one wide blade, on a waterline.
  finswimming: (
    <>
      <path d="M25 10 Q24 22 27 26 L31 26 Q32 18 31 10 Z" />
      <path d="M33 10 Q32 18 33 26 L37 26 Q40 22 39 10 Z" />
      <path d="M25 26 L39 26 L52 44 Q32 50 12 44 Z" />
      <path d="M32 29 L32 44" />
      <path d="M8 54 Q14 50 20 54 T32 54 T44 54 T56 54" />
    </>
  ),
  // A closed fist striking the ball, with the tape strung between two posts.
  fistball: (
    <>
      <path d="M10 56 L10 30 M54 56 L54 30 M10 32 L54 32" />
      <circle cx="26" cy="15" r="7" />
      <rect x="18" y="38" width="16" height="11" rx="4" />
      <path d="M22 38 L22 43 M26 38 L26 43 M30 38 L30 43 M22 49 L22 56 M30 49 L30 56" />
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
