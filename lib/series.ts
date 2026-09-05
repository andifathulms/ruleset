import type { Series, SeriesPoint, SeriesSegment } from './types'

/**
 * Segment handling. The hard rules live here rather than in the chart component,
 * so that no future chart can accidentally opt out of them.
 *
 * Rule 1 — never draw a line across a break. Enforced structurally: this module
 * never returns a single point list for a broken series, and never returns a
 * shared scale for two segments. There is no function here that could produce
 * a path spanning a break, so a caller cannot draw one by mistake.
 *
 * Rule 4 — a scoped series is labelled with its competition in the title.
 * `chartTitle` is the only supported way to name a series, and it refuses to
 * omit the competition.
 *
 * Rule 5 — where a series cannot exist, `layoutSeries` returns `kind: 'absent'`
 * carrying the prose, and the caller renders that prose in the chart's place.
 */

export interface SegmentLayout {
  id: string
  from: number
  /** Open-ended segments run to the last point they actually have. */
  to: number
  points: SeriesPoint[]
  note?: string
  /** Fraction of the plot width this segment occupies, before the gutter. */
  widthFraction: number
  /** Left edge as a fraction of the plot width, gutters already subtracted. */
  offsetFraction: number
  /** Each segment carries its own y domain. Segments must not share a baseline. */
  yDomain: [number, number]
  xDomain: [number, number]
}

export type SeriesLayout =
  | { kind: 'absent'; reason: string }
  | { kind: 'chartable'; segments: SegmentLayout[]; unit: string; higherIsBetter: boolean }

/** The gutter drawn at a break, as a fraction of plot width. Visible on purpose. */
export const BREAK_GUTTER = 0.07

function span(seg: SeriesSegment): { from: number; to: number } {
  const years = seg.points.map((p) => p.year)
  const to = seg.to ?? (years.length ? Math.max(...years) : seg.from)
  return { from: seg.from, to: Math.max(to, seg.from + 1) }
}

function padded(values: number[]): [number, number] {
  if (!values.length) return [0, 1]
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (lo === hi) return [lo - 1, hi + 1]
  const pad = (hi - lo) * 0.18
  return [lo - pad, hi + pad]
}

/**
 * Throws at build time if a segment's points fall outside the segment's own
 * span, or if any point sits on the far side of the break from its segment.
 * A silently misfiled point is exactly how a line ends up crossing a break.
 */
export function assertSegmentsAreClean(series: Series): void {
  const at = series.break?.at
  for (const seg of series.segments) {
    const { from, to } = span(seg)
    for (const p of seg.points) {
      if (p.year < from || p.year > to) {
        throw new Error(
          `series ${series.id}: point ${p.year} lies outside segment ${seg.id} (${from}–${to})`,
        )
      }
      if (at !== undefined) {
        const before = from < at
        if (before && p.year > at) {
          throw new Error(
            `series ${series.id}: point ${p.year} in pre-break segment ${seg.id} crosses the ${at} break`,
          )
        }
        if (!before && p.year < at) {
          throw new Error(
            `series ${series.id}: point ${p.year} in post-break segment ${seg.id} crosses the ${at} break`,
          )
        }
      }
    }
  }
}

export function layoutSeries(series: Series): SeriesLayout {
  if (series.cannot_exist) return { kind: 'absent', reason: series.cannot_exist }
  assertSegmentsAreClean(series)

  const spans = series.segments.map(span)
  const total = spans.reduce((sum, s) => sum + (s.to - s.from), 0)
  const gutters = Math.max(0, series.segments.length - 1) * BREAK_GUTTER
  const usable = 1 - gutters

  let offset = 0
  const segments: SegmentLayout[] = series.segments.map((seg, i) => {
    const { from, to } = spans[i]
    const widthFraction = total > 0 ? ((to - from) / total) * usable : usable
    const layout: SegmentLayout = {
      id: seg.id,
      from,
      to,
      points: [...seg.points].sort((a, b) => a.year - b.year),
      note: seg.note,
      widthFraction,
      offsetFraction: offset,
      // Own domain, own baseline. This is what stops the eye completing the line.
      yDomain: padded(seg.points.map((p) => p.value)),
      xDomain: [from, to],
    }
    offset += widthFraction + BREAK_GUTTER
    return layout
  })

  return {
    kind: 'chartable',
    segments,
    unit: series.unit,
    higherIsBetter: series.higher_is_better ?? true,
  }
}

/**
 * The only supported way to name a series. Rule 4: a series scoped to one
 * competition carries that competition in the chart title itself, never in a
 * footnote, so it can never be read as the sport's own series.
 */
export function chartTitle(series: Series): string {
  return series.competition ? `${series.label} — ${series.competition}` : series.label
}

/** True where the series is scoped to a named competition rather than the sport. */
export const isScoped = (series: Series): boolean => Boolean(series.competition)

export const BREAK_KIND_LABEL: Record<string, string> = {
  reset: 'Record book reset',
  retained: 'Rule changed, marks retained',
  'scale-change': 'Measurement scale changed',
  scoped: 'Scoped to one competition',
  none: 'No break',
}
