import type { MarkShape } from '@/lib/types'

/**
 * Cause is carried by shape, never by colour — colour is already carrying sport
 * family. Every glyph must therefore be distinguishable in greyscale and at
 * roughly 11 px, which is what sets the size of these paths.
 */
export function markPath(shape: MarkShape, r = 5.5): string {
  const s = r
  switch (shape) {
    case 'square':
      return `M${-s},${-s}H${s}V${s}H${-s}Z`
    case 'triangle':
      return `M0,${-s * 1.15}L${s},${s * 0.8}H${-s}Z`
    case 'diamond':
      return `M0,${-s * 1.25}L${s * 1.05},0L0,${s * 1.25}L${-s * 1.05},0Z`
    case 'circle':
      return `M${-s},0a${s},${s} 0 1,0 ${s * 2},0a${s},${s} 0 1,0 ${-s * 2},0Z`
    case 'hollow-circle':
      return `M${-s},0a${s},${s} 0 1,0 ${s * 2},0a${s},${s} 0 1,0 ${-s * 2},0Z`
    case 'cross':
      return `M${-s * 0.36},${-s}H${s * 0.36}V${-s * 0.36}H${s}V${s * 0.36}H${s * 0.36}V${s}H${-s * 0.36}V${s * 0.36}H${-s}V${-s * 0.36}H${-s * 0.36}Z`
    case 'bar':
      return `M${-s * 1.15},${-s * 0.45}H${s * 1.15}V${s * 0.45}H${-s * 1.15}Z`
    case 'chevron':
      return `M0,${-s * 1.1}L${s},${s * 0.25}L${s * 0.55},${s * 0.85}L0,${-s * 0.05}L${-s * 0.55},${s * 0.85}L${-s},${s * 0.25}Z`
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2
        return `${(Math.cos(a) * s * 1.1).toFixed(2)},${(Math.sin(a) * s * 1.1).toFixed(2)}`
      })
      return `M${pts.join('L')}Z`
    }
    default:
      return `M${-s},0a${s},${s} 0 1,0 ${s * 2},0a${s},${s} 0 1,0 ${-s * 2},0Z`
  }
}

/** `disputed` is drawn hollow and desaturated, so it reads as quiet, not broken. */
export const isHollow = (shape: MarkShape) => shape === 'hollow-circle'

export function Mark({
  shape,
  size = 5.5,
  colour = '#F2F5F1',
  withdrawn = false,
}: {
  shape: MarkShape
  size?: number
  colour?: string
  withdrawn?: boolean
}) {
  const hollow = isHollow(shape) || withdrawn
  return (
    <path
      d={markPath(shape, size)}
      fill={hollow ? 'none' : colour}
      stroke={colour}
      // A rule adopted and then rescinded is drawn as an outline: it was on the
      // books, so it belongs on the lane, but it never governed anything. A
      // dashed outline was illegible at 11px, so the weight carries it instead.
      strokeWidth={hollow ? 1.6 : 0.75}
    />
  )
}

export function MarkGlyph({
  shape,
  label,
  withdrawn,
}: {
  shape: MarkShape
  label: string
  withdrawn?: boolean
}) {
  return (
    <svg width={18} height={18} viewBox="-9 -9 18 18" role="img" aria-label={label} className="shrink-0">
      <Mark shape={shape} size={5.5} withdrawn={withdrawn} />
    </svg>
  )
}
