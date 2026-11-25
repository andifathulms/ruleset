/**
 * Draws a sport's playing area from field.yaml.
 *
 * The file gives shapes in the sport's own unit, almost always metres, and
 * this places every one of them with a single scale, so a drawing marked
 * to-scale is to scale by construction rather than by care. It returns an SVG
 * string and imports nothing, because two things call it: the sport page, and
 * scripts/field-preview.mjs, which renders a drawing to a PNG so it can be
 * looked at before it ships.
 */

export type FieldFill = 'none' | 'surface' | 'area' | 'zone' | 'target'
export type FieldLine = 'solid' | 'dashed' | 'heavy' | 'faint' | 'none'

export type FieldShape =
  | { type: 'rect'; x: number; y: number; w: number; h: number; fill?: FieldFill; line?: FieldLine }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; line?: FieldLine }
  | { type: 'circle'; cx: number; cy: number; r: number; fill?: FieldFill; line?: FieldLine }
  /** Degrees, 0 pointing right, increasing clockwise as drawn. */
  | { type: 'arc'; cx: number; cy: number; r: number; from: number; to: number; line?: FieldLine }
  | { type: 'polygon'; points: [number, number][]; fill?: FieldFill; line?: FieldLine }
  /** A player, a ball, a target: a fixed-size mark with an optional label under it. */
  | { type: 'dot'; x: number; y: number; label?: string }
  | { type: 'label'; x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; tone?: 'chalk' | 'muted' }
  /** A measurement: a thin line between two points with its figure at the middle. */
  | { type: 'dim'; x1: number; y1: number; x2: number; y2: number; text: string }

export interface FieldSpec {
  sport: string
  title: string
  eyebrow?: string
  caption: string
  /** What the drawing shows, in a sentence, for a reader who cannot see it. */
  alt: string
  scale: 'to-scale' | 'schematic'
  /** The part of the plane shown: [left, top, right, bottom], in the sport's unit. */
  view: [number, number, number, number]
  shapes: FieldShape[]
  legend?: { swatch: FieldFill | FieldLine; label: string }[]
}

export const FIELD_SHAPES = ['rect', 'line', 'circle', 'arc', 'polygon', 'dot', 'label', 'dim'] as const
export const FIELD_FILLS = ['none', 'surface', 'area', 'zone', 'target'] as const
export const FIELD_LINES = ['solid', 'dashed', 'heavy', 'faint', 'none'] as const

const CHALK = '#F2F5F1'
const MUTED = '#9FB2B0'
const WIDTH = 480

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const n = (v: number) => (Math.round(v * 100) / 100).toString()

export function fillAttrs(fill: FieldFill | undefined, colour: string): string {
  switch (fill) {
    case 'surface': return `fill="${CHALK}" fill-opacity="0.06"`
    case 'area': return `fill="${colour}" fill-opacity="0.16"`
    case 'zone': return `fill="${colour}" fill-opacity="0.42"`
    case 'target': return `fill="${colour}" fill-opacity="0.85"`
    default: return 'fill="none"'
  }
}

function lineAttrs(line: FieldLine | undefined, fallback: FieldLine = 'solid'): string {
  switch (line ?? fallback) {
    case 'none': return 'stroke="none"'
    case 'dashed': return `stroke="${CHALK}" stroke-width="1.5" stroke-dasharray="5 4"`
    case 'heavy': return `stroke="${CHALK}" stroke-width="3"`
    case 'faint': return `stroke="${CHALK}" stroke-width="1" stroke-opacity="0.4"`
    default: return `stroke="${CHALK}" stroke-width="1.5"`
  }
}

/** The height the drawing takes at the fixed width, for layout. */
export function fieldAspect(spec: FieldSpec): number {
  const [l, t, r, b] = spec.view
  return (b - t) / (r - l)
}

export function fieldSvg(spec: FieldSpec, colour: string): string {
  const [left, top, right, bottom] = spec.view
  const k = WIDTH / (right - left)
  const height = (bottom - top) * k
  const X = (v: number) => n((v - left) * k)
  const Y = (v: number) => n((v - top) * k)
  const L = (v: number) => n(v * k)

  const out: string[] = []
  for (const s of spec.shapes) {
    switch (s.type) {
      case 'rect':
        out.push(`<rect x="${X(s.x)}" y="${Y(s.y)}" width="${L(s.w)}" height="${L(s.h)}" ${fillAttrs(s.fill, colour)} ${lineAttrs(s.line)}/>`)
        break
      case 'line':
        out.push(`<line x1="${X(s.x1)}" y1="${Y(s.y1)}" x2="${X(s.x2)}" y2="${Y(s.y2)}" ${lineAttrs(s.line)}/>`)
        break
      case 'circle':
        out.push(`<circle cx="${X(s.cx)}" cy="${Y(s.cy)}" r="${L(s.r)}" ${fillAttrs(s.fill, colour)} ${lineAttrs(s.line)}/>`)
        break
      case 'arc': {
        const rad = (d: number) => (d * Math.PI) / 180
        const x1 = s.cx + s.r * Math.cos(rad(s.from))
        const y1 = s.cy + s.r * Math.sin(rad(s.from))
        const x2 = s.cx + s.r * Math.cos(rad(s.to))
        const y2 = s.cy + s.r * Math.sin(rad(s.to))
        const sweep = ((s.to - s.from) % 360 + 360) % 360
        out.push(`<path d="M${X(x1)} ${Y(y1)} A${L(s.r)} ${L(s.r)} 0 ${sweep > 180 ? 1 : 0} 1 ${X(x2)} ${Y(y2)}" fill="none" ${lineAttrs(s.line)}/>`)
        break
      }
      case 'polygon':
        out.push(`<polygon points="${s.points.map(([px, py]) => `${X(px)},${Y(py)}`).join(' ')}" ${fillAttrs(s.fill, colour)} ${lineAttrs(s.line)}/>`)
        break
      case 'dot':
        out.push(`<circle cx="${X(s.x)}" cy="${Y(s.y)}" r="4.5" fill="${CHALK}"/>`)
        if (s.label) {
          out.push(`<text x="${X(s.x)}" y="${n((s.y - top) * k + 17)}" font-size="11.5" fill="${CHALK}" text-anchor="middle">${esc(s.label)}</text>`)
        }
        break
      case 'label':
        out.push(`<text x="${X(s.x)}" y="${Y(s.y)}" font-size="12" fill="${s.tone === 'muted' ? MUTED : CHALK}" text-anchor="${s.anchor ?? 'middle'}" dominant-baseline="middle">${esc(s.text)}</text>`)
        break
      case 'dim': {
        const mx = ((s.x1 + s.x2) / 2 - left) * k
        const my = ((s.y1 + s.y2) / 2 - top) * k
        const vertical = Math.abs(s.x2 - s.x1) < Math.abs(s.y2 - s.y1)
        const gap = vertical ? 9 : Math.max(18, s.text.length * 3.6 + 6)
        const x1 = (s.x1 - left) * k, y1 = (s.y1 - top) * k
        const x2 = (s.x2 - left) * k, y2 = (s.y2 - top) * k
        if (vertical) {
          out.push(`<line x1="${n(x1)}" y1="${n(Math.min(y1, y2))}" x2="${n(x1)}" y2="${n(my - gap)}" stroke="${MUTED}"/>`)
          out.push(`<line x1="${n(x1)}" y1="${n(my + gap)}" x2="${n(x1)}" y2="${n(Math.max(y1, y2))}" stroke="${MUTED}"/>`)
        } else {
          out.push(`<line x1="${n(Math.min(x1, x2))}" y1="${n(y1)}" x2="${n(mx - gap)}" y2="${n(y1)}" stroke="${MUTED}"/>`)
          out.push(`<line x1="${n(mx + gap)}" y1="${n(y1)}" x2="${n(Math.max(x1, x2))}" y2="${n(y1)}" stroke="${MUTED}"/>`)
        }
        out.push(`<text x="${n(mx)}" y="${n(my)}" class="numeral" font-size="12.5" fill="${CHALK}" text-anchor="middle" dominant-baseline="middle">${esc(s.text)}</text>`)
        break
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${n(height)}" role="img" aria-label="${esc(spec.alt)}" style="width:100%;height:auto;display:block">${out.join('')}</svg>`
}
