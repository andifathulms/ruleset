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

export type BreakKind =
  | 'reset'
  | 'retained'
  | 'scale-change'
  | 'scoped'
  | 'unified'
  | 'none'

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
  /**
   * A series can be severed more than once, and pretending otherwise was a
   * modelling error. The javelin was reset in 1986 and had marks annulled again
   * in 1992; the hour record was split in 1997 and reunified in 2014. Normalised
   * by the loader, which still accepts a single `break:` in YAML.
   */
  breaks: SeriesBreak[]
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

/* ------------------------------------------------------------ learning curve */

/**
 * Five-point ordinal, not a score out of ten. There is no arithmetic anywhere
 * on these values and they are never summed, averaged or ranked against each
 * other — a sport is not 1.7 times harder than another and this site will not
 * imply that it is.
 */
export const DIFFICULTY = ['very-low', 'low', 'moderate', 'high', 'very-high'] as const
export type Difficulty = (typeof DIFFICULTY)[number]

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  'very-low': 'Very low',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  'very-high': 'Very high',
}

/**
 * What a piece of evidence actually is. The distinction is the whole point:
 *   rule        a sourced rule on this site, and it links to it
 *   observation a checkable fact about the sport that is not a rule
 *   judgement   the author's estimate, unsourced, and marked as such
 */
export type EvidenceBasis = 'rule' | 'observation' | 'judgement'

export interface Evidence {
  label: string
  value: string
  basis: EvidenceBasis
  /** Required when basis is `rule`: the rule change this comes from. */
  rule?: string
  note?: string
}

export interface LearningAxis {
  verdict: Difficulty
  claim: string
  why: string
  evidence: Evidence[]
}

export interface Learning {
  sport: string
  /**
   * Always `editorial`. The verdicts here are the site's own reading, not a
   * sourced fact, and the interface says so rather than letting them sit
   * alongside the citations as though they were the same kind of claim.
   */
  standing: 'editorial'
  summary: string
  entry: LearningAxis
  mastery: LearningAxis
  /** Why the two verdicts differ, which is the part worth reading. */
  gap: string
  /** Rule changes that moved the curve in either direction. */
  shaped_by?: string[]
}

/* -------------------------------------------------- disciplines and events */

export interface EventEntry {
  id: string
  label: string
  note?: string
  olympic?: boolean
  /**
   * How many medal events this row stands for. A row reading "Sprints — 100,
   * 200, 400 m" is six medal events once men's and women's are counted
   * separately, and a total built by counting rows would say one. Defaults to 1.
   */
  count?: number
}

export interface Discipline {
  id: string
  label: string
  blurb?: string
  /**
   * False for a group listed only for context — the other disciplines of
   * aquatics, football's variants — which must not be added to this sport's
   * own totals.
   */
  counts?: boolean
  events: EventEntry[]
}

export interface Events {
  sport: string
  as_of: string
  source: string
  standing: SourceStanding
  summary: string
  disciplines: Discipline[]
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
