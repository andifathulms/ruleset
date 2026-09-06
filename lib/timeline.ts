import type {
  CauseId, FamilyColour, Lens, LensGroup, RuleChange, Series,
} from './types'

/**
 * Lane construction for the cross-sport timeline. A lens re-lanes the whole
 * board: switching lens changes which lanes exist and which marks sit in them,
 * rather than recolouring marks in place.
 */

export interface TimelineMark {
  id: string
  year: number
  /** Fractional position within the year, so two marks in one year separate. */
  time: number
  sport: string
  label: string
  cause: CauseId
  /** Set when this rule change caused a comparability break in some series. */
  breaksSeries?: { seriesId: string; kind: string; at: number }
}

export interface Lane {
  id: string
  label: string
  colour: FamilyColour
  members: string[]
  marks: TimelineMark[]
  /** Years at which this lane's centre line stops, steps, and resumes. */
  breaks: { year: number; ruleId: string; kind: string; note: string }[]
  /** True where the lane has no rule changes under the current lens. */
  empty: boolean
}

/** Decimal year from an ISO-ish date string: 2006-02-01, 2005-12, or 1986. */
export function decimalYear(date: string): number {
  const [y, m = '1', d = '1'] = date.split('-')
  const year = Number(y)
  const month = Number(m)
  const day = Number(d)
  if (!Number.isFinite(year)) return NaN
  return year + ((month - 1) + (day - 1) / 30.4) / 12
}

export const yearOf = (date: string): number => Number(date.split('-')[0])

/** One line of prose per mark, so the timeline reads without opening anything. */
function shortLabel(rule: RuleChange): string {
  const first = rule.what_changed.trim().split(/(?<=\.)\s/)[0]
  return first.length > 92 ? `${first.slice(0, 89).trimEnd()}…` : first
}

export function buildMarks(
  rules: RuleChange[],
  series: { sport: string; series: Series }[],
): TimelineMark[] {
  const brokenBy = new Map<string, { seriesId: string; kind: string; at: number }>()
  for (const { series: s } of series) {
    // Each break names the rule that caused it, so a series broken twice
    // attaches to two different marks on the lane.
    for (const b of s.breaks) {
      brokenBy.set(b.caused_by, { seriesId: s.id, kind: b.kind, at: b.at })
    }
  }

  return rules.map((rule) => ({
    id: rule.id,
    year: yearOf(rule.date_effective),
    time: decimalYear(rule.date_effective),
    sport: rule.scope.sport,
    label: shortLabel(rule),
    cause: rule.cause_primary,
    breaksSeries: brokenBy.get(rule.id),
  }))
}

export function buildLanes(
  lens: Lens,
  marks: TimelineMark[],
  series: { sport: string; series: Series }[],
): Lane[] {
  const seriesById = new Map(series.map(({ series: s }) => [s.id, s]))

  return lens.groups.map((group: LensGroup) => {
    const own = marks.filter((m) => group.members.includes(m.sport))
    const breaks = own
      .filter((m) => m.breaksSeries)
      .map((m) => {
        const s = seriesById.get(m.breaksSeries!.seriesId)
        return {
          year: m.breaksSeries!.at,
          ruleId: m.id,
          kind: m.breaksSeries!.kind,
          note: s?.breaks.find((b) => b.at === m.breaksSeries!.at)?.note ?? '',
        }
      })
      .sort((a, b) => a.year - b.year)

    return {
      id: group.id,
      label: group.label,
      colour: group.colour,
      members: group.members,
      marks: own.sort((a, b) => a.time - b.time),
      breaks,
      empty: own.length === 0,
    }
  })
}

/**
 * The one memorable move (DESIGN.md): the lane's centre line stops at a break,
 * steps vertically, and resumes offset. Returns the drawable pieces of one
 * lane's centre line — never one continuous path.
 *
 * `x` maps a year to a pixel. `stepPx` is how far the line offsets at a break.
 * Only a comparability break may interrupt a lane; nothing else calls this.
 */
export interface LaneLinePiece {
  x1: number
  x2: number
  /** Vertical offset from the lane's centre, in pixels. */
  dy: number
}

export function laneLinePieces(
  lane: Lane,
  x: (year: number) => number,
  domain: [number, number],
  opts: { gapPx?: number; stepPx?: number } = {},
): { pieces: LaneLinePiece[]; steps: { x: number; from: number; to: number; year: number }[] } {
  const gapPx = opts.gapPx ?? 14
  const stepPx = opts.stepPx ?? 9

  const cuts = lane.breaks
    .map((b) => b.year)
    .filter((y) => y > domain[0] && y < domain[1])
    .sort((a, b) => a - b)

  const pieces: LaneLinePiece[] = []
  const steps: { x: number; from: number; to: number; year: number }[] = []

  let cursor = x(domain[0])
  let dy = 0
  cuts.forEach((year, i) => {
    const at = x(year)
    pieces.push({ x1: cursor, x2: at - gapPx / 2, dy })
    const next = dy + (i % 2 === 0 ? stepPx : -stepPx)
    steps.push({ x: at, from: dy, to: next, year })
    dy = next
    cursor = at + gapPx / 2
  })
  pieces.push({ x1: cursor, x2: x(domain[1]), dy })

  return { pieces, steps }
}

/** Vertical offset of a mark, given the lane pieces it sits between. */
export function markOffset(pieces: LaneLinePiece[], px: number): number {
  const piece = pieces.find((p) => px >= p.x1 && px <= p.x2)
  return piece ? piece.dy : (pieces[pieces.length - 1]?.dy ?? 0)
}

export function timeDomain(marks: TimelineMark[], pad = 6): [number, number] {
  if (!marks.length) return [1900, 2030]
  const years = marks.map((m) => m.time)
  return [Math.floor(Math.min(...years)) - pad, Math.ceil(Math.max(...years)) + pad]
}

export interface Filters {
  causes: CauseId[]
  from: number
  to: number
}

export function applyFilters(marks: TimelineMark[], f: Filters): TimelineMark[] {
  return marks.filter(
    (m) => (f.causes.length === 0 || f.causes.includes(m.cause)) && m.year >= f.from && m.year <= f.to,
  )
}
