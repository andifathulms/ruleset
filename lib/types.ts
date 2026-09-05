export type FamilyColour = 'pool' | 'pitch' | 'clay' | 'gold' | 'unmarked'

export type CauseId =
  | 'safety'
  | 'broadcast and pacing'
  | 'dominance suppression'
  | 'equipment and technology'
  | 'fairness and eligibility'
  | 'commercial'
  | 'participation and access'
  | 'integrity'
  | 'disputed'

export type MarkShape =
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'circle'
  | 'cross'
  | 'bar'
  | 'chevron'
  | 'hexagon'
  | 'hollow-circle'

export interface Cause {
  id: CauseId
  label: string
  mark: MarkShape
  definition: string
}

export interface LensGroup {
  id: string
  label: string
  colour: FamilyColour
  members: string[]
}

export interface Lens {
  id: string
  label: string
  blurb: string
  source: string | null
  groups: LensGroup[]
}

export type SourceStanding = 'primary-checked' | 'primary-named' | 'secondary' | 'absent'

export interface Source {
  id: string
  standing: SourceStanding
  title: string
  publisher: string
  kind: string
  url?: string
  note?: string
}

export interface Citation {
  source: string
  edition?: string
  article?: string
  /** Set when the entry has no usable citation. Rule 2: it renders as incomplete. */
  missing?: boolean
}

export interface Trigger {
  description: string
  /** Present where the stated reason and the widely-believed reason differ. */
  also_said?: string
  source?: string
}

export interface RuleChange {
  id: string
  scope: { sport: string; discipline?: string; event?: string }
  date_adopted?: string
  date_effective: string
  governing_body: string
  what_changed: string
  cause_primary: CauseId
  cause_secondary?: CauseId
  trigger?: Trigger
  citation: Citation
  comparability_break?: string
}

export type BreakKind = 'reset' | 'retained' | 'scale-change' | 'scoped' | 'none'

export interface SeriesPoint {
  year: number
  value: number
  holder?: string
  detail?: string
  source?: string
}

export interface SeriesSegment {
  id: string
  from: number
  to: number | null
  points: SeriesPoint[]
}

export interface SeriesBreak {
  at: number
  caused_by: string
  kind: BreakKind
  note: string
}

export interface Series {
  id: string
  label: string
  unit: string
  /** Set when the series belongs to one named competition, not the sport. Rule 4. */
  competition?: string
  /** Set when no chartable series can exist. Rule 5: prose replaces the chart. */
  cannot_exist?: string
  higher_is_better?: boolean
  segments: SeriesSegment[]
  break?: SeriesBreak
  source?: string
}

export interface Sport {
  id: string
  label: string
  tagline?: string
  governing_body: string
  founded?: string
  coverage: 'deep' | 'skeleton'
  family_colour: FamilyColour
  classification: Record<string, string>
  summary?: string
}

export interface ProgramSport {
  id: string
  label: string
  coverage: 'deep' | 'skeleton'
  governing_body: string | null
  note?: string
  held: number[]
}

export interface Edition {
  year: number
  city: string
  note?: string
  status?: 'planned'
}

export interface Program {
  source: string
  last_reviewed: string
  editions: Edition[]
  sports: ProgramSport[]
}
