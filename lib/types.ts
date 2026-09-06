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
  /**
   * adopted   in force, and still in force or superseded normally
   * trial-only tried under a stated trial and then abandoned
   * withdrawn adopted but rescinded before it was ever enforced
   */
  status?: 'adopted' | 'trial-only' | 'withdrawn'
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
  /** Rendered in place of a line where a segment is legitimately empty. */
  note?: string
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
  /**
   * Why the series is absent, which is not one thing:
   *   impossible   no comparable series can exist, in principle
   *   unpublished  a series could exist but no governing body publishes one
   */
  absence_kind?: 'impossible' | 'unpublished'
  higher_is_better?: boolean
  segments: SeriesSegment[]
  break?: SeriesBreak
  source?: string
}

/**
 * The current law layer — what the rules actually say now, as opposed to how
 * they changed. Canonical section ids, in this order, so that the same clause
 * can be compared across sports: a scoring section in badminton and a scoring
 * section in gymnastics are answers to the same question.
 */
export const LAW_SECTIONS = [
  'object',
  'field',
  'equipment',
  'players',
  'duration',
  'scoring',
  'restarts',
  'prohibitions',
  'winning',
] as const

export type LawSectionId = (typeof LAW_SECTIONS)[number]

/**
 * Neutral names for the nine questions. Each sport titles its own answer in its
 * own vocabulary — athletics calls it Measurement, swimming calls it Timing —
 * so the shared question needs a name that belongs to none of them.
 */
export const LAW_SECTION_LABEL: Record<LawSectionId, string> = {
  object: 'The object',
  field: 'Where it is played',
  equipment: 'Equipment',
  players: 'Players and officials',
  duration: 'Format and time',
  scoring: 'Scoring',
  restarts: 'Starting and restarting',
  prohibitions: 'What is forbidden',
  winning: 'Deciding the winner',
}

export interface LawFact {
  label: string
  value: string
  note?: string
}

export interface LawSection {
  id: LawSectionId
  label: string
  body: string
  /** Measurements and limits, which is what a reader usually came for. */
  facts?: LawFact[]
  /**
   * Rule changes on this site's timeline that produced the clause as it now
   * reads. This is what stops the layer being a generic encyclopedia: the
   * current law is the accumulated output of the changes, and says so.
   */
  shaped_by?: string[]
  citation?: Citation
}

export interface Play {
  sport: string
  /** When this snapshot of the laws was taken. */
  as_of: string
  /** The edition in force, named exactly. */
  edition: string
  source: string
  /** How far the figures below have been checked against that edition. */
  standing: SourceStanding
  summary: string
  sections: LawSection[]
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

/**
 * A photograph used on the site. Treated as a citation, not as decoration:
 * `shows` records what the image is actually evidence of, which is often
 * narrower than the section it sits in.
 */
export interface SourcedImage {
  id: string
  sport: string
  file: string
  width: number
  height: number
  alt: string
  shows: string
  title: string
  author: string
  licence: string
  licence_url?: string
  source_url: string
}
