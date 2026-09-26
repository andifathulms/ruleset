import { asset } from '@/lib/asset'

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

export interface CoverImage {
  file: string
  alt: string
  width: number
  height: number
  position?: string
}

/**
 * A sport's cover: its chosen photograph tinted into the family colour, or,
 * where it has none, a painted-court panel with its initials. The panel is
 * deliberately generic line-work — a court, not this sport's court — so it
 * never passes for a drawing of something the site has not drawn.
 *
 * Fills its parent; the parent sets the size and aspect.
 */
export default function SportCover({
  image,
  colour,
  label,
  eager = false,
  className = '',
}: {
  image: CoverImage | null
  colour: string
  label: string
  /** The page header's cover is the largest thing above the fold. */
  eager?: boolean
  className?: string
}) {
  const c = COLOUR[colour] ?? COLOUR.unmarked
  const style = { ['--tint' as string]: c.base, ['--tint-bright' as string]: c.bright }

  if (!image) {
    return (
      <div aria-hidden className={`cover-painted ${className}`} style={style}>
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-40">
          <g stroke="#F2F5F1" strokeWidth="1.4" fill="none" vectorEffect="non-scaling-stroke">
            <rect x="24" y="22" width="272" height="156" />
            <line x1="160" y1="22" x2="160" y2="178" />
            <circle cx="160" cy="100" r="30" />
            <rect x="24" y="62" width="44" height="76" />
            <rect x="252" y="62" width="44" height="76" />
          </g>
        </svg>
        <span className="display-xl absolute right-4 top-1 font-display text-[88px] leading-none text-chalk/[0.14]">
          {monogram(label)}
        </span>
      </div>
    )
  }

  return (
    <div className={`cover ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(image.file)}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={image.position ? { objectPosition: image.position } : undefined}
      />
    </div>
  )
}

/** Two letters for a sport with no pictogram and no photograph. */
export function monogram(label: string): string {
  return label.replace(/[^A-Za-z]/g, '').slice(0, 2)
}
