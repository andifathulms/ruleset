import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type {
  Cause, Events, Learning, Lens, Play, Program, RuleChange, Series, Source,
  SeriesBreak, SourcedImage, Sport,
} from './types'
import { CONTEST_STATUS, LAW_SECTIONS } from './types'

const CONTENT = path.join(process.cwd(), 'content')
const SPORTS = path.join(CONTENT, 'sports')

/**
 * CORE_SCHEMA rather than the default: the default schema turns `2006-01-01`
 * into a Date and `1996` into a number, so a date field's type depended on how
 * precisely it happened to be written. Here every scalar is a JSON type, and
 * dates are normalised to strings on the way out.
 */
function parse<T>(text: string): T {
  return yaml.load(text, { schema: yaml.CORE_SCHEMA }) as T
}

function readYaml<T>(...parts: string[]): T {
  return parse<T>(fs.readFileSync(path.join(...parts), 'utf8'))
}

/** `1986` and `1986-04-01` are both dates; only one of them parses as a string. */
const asDate = (v: unknown): string => (v == null ? '' : String(v))

/**
 * A date must begin with a four-digit year. `1990s` looks reasonable in YAML
 * and is not a year: Number('1990s') is NaN, which propagated through the
 * timeline's domain and silently filtered every mark off the board. The
 * homepage rendered its lanes and nothing in them, with no error anywhere.
 */
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/

function assertDate(sport: string, rule: string, field: string, value: string): string {
  if (!DATE.test(value)) {
    throw new Error(
      `rules.yaml (${sport}): ${rule}.${field} is "${value}", which is not a date. ` +
        'Use YYYY, YYYY-MM or YYYY-MM-DD — an approximate decade must still be a single year.',
    )
  }
  return value
}

function dirs(at: string): string[] {
  if (!fs.existsSync(at)) return []
  return fs.readdirSync(at, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

export const getCauses = (): Cause[] => readYaml<Cause[]>(CONTENT, 'causes.yaml')
export const getLenses = (): Lens[] => readYaml<Lens[]>(CONTENT, 'lenses.yaml')
export const getSources = (): Source[] => readYaml<Source[]>(CONTENT, 'sources.yaml')
const PROGRAMMES = path.join(CONTENT, 'programmes')

/**
 * The programmes, Olympic first. The Olympic one used to be `program.yaml` at
 * the root, which quietly made it the axis every other competition was
 * measured against rather than one programme among them.
 */
export function getProgrammes(): Program[] {
  const files = fs.readdirSync(PROGRAMMES).filter((f) => f.endsWith('.yaml')).sort()
  const all = files.map((f) => parse<Program>(fs.readFileSync(path.join(PROGRAMMES, f), 'utf8')))
  return all.sort((a, b) => (a.id === 'olympic' ? -1 : b.id === 'olympic' ? 1 : a.label.localeCompare(b.label)))
}

export function getProgramme(id: string): Program {
  const found = getProgrammes().find((p) => p.id === id)
  if (!found) throw new Error(`no programme "${id}" under content/programmes`)
  return found
}

/** The Olympic programme, which several pages still ask for by name. */
export const getProgram = (): Program => getProgramme('olympic')

export const getSourceMap = (): Record<string, Source> =>
  Object.fromEntries(getSources().map((s) => [s.id, s]))

export const getCauseMap = (): Record<string, Cause> =>
  Object.fromEntries(getCauses().map((c) => [c.id, c]))

/**
 * Every sport under /content/sports. A directory only counts once it has a
 * sport.yaml: a half-created one otherwise crashed the build with an ENOENT
 * naming a file the author already knew was missing.
 */
export function getSportIds(): string[] {
  return dirs(SPORTS).filter((id) => fs.existsSync(path.join(SPORTS, id, 'sport.yaml')))
}

/**
 * An unquoted YAML scalar containing ": " parses as a nested mapping, so a
 * tagline reading "answered it the other way: no times at all" silently became
 * an object and surfaced as an unreadable prerender error three pages away.
 * Caught here, where the message can name the file.
 */
export function getSport(id: string): Sport {
  const sport = readYaml<Sport>(SPORTS, id, 'sport.yaml')
  for (const field of ['tagline', 'summary', 'governing_body', 'founded'] as const) {
    const value = sport[field]
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(
        `sport.yaml (${id}): "${field}" did not parse as text. A colon followed by a space in an unquoted YAML scalar makes it a mapping — quote the value.`,
      )
    }
  }
  return sport
}

export function getSports(): Sport[] {
  return getSportIds().map(getSport)
}

export function getRuleChanges(id: string): RuleChange[] {
  const file = path.join(SPORTS, id, 'rules.yaml')
  if (!fs.existsSync(file)) return []
  const rules = parse<RuleChange[] | null>(fs.readFileSync(file, 'utf8')) ?? []
  return rules
    .map((r) => ({
      ...r,
      date_effective: assertDate(id, r.id, 'date_effective', asDate(r.date_effective)),
      date_adopted: r.date_adopted
        ? assertDate(id, r.id, 'date_adopted', asDate(r.date_adopted))
        : undefined,
    }))
    .sort((a, b) => a.date_effective.localeCompare(b.date_effective))
}

/** Every rule change across every sport, in date order. The timeline's input. */
export function getAllRuleChanges(): RuleChange[] {
  return getSportIds()
    .flatMap(getRuleChanges)
    .sort((a, b) => a.date_effective.localeCompare(b.date_effective))
}

export function getSeriesForSport(id: string): Series[] {
  const at = path.join(SPORTS, id, 'series')
  if (!fs.existsSync(at)) return []
  return fs.readdirSync(at)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => normaliseSeries(parse<Series & { break?: SeriesBreak }>(
      fs.readFileSync(path.join(at, f), 'utf8'),
    )))
}

/**
 * A series carries a list of breaks. YAML may still write a single `break:`,
 * which is normalised here so content files never have to say `breaks: [ ... ]`
 * for the common case of one.
 */
function normaliseSeries(raw: Series & { break?: SeriesBreak }): Series {
  const { break: single, ...rest } = raw
  const breaks = [...(raw.breaks ?? []), ...(single ? [single] : [])].sort(
    (a, b) => a.at - b.at,
  )
  return { ...(rest as Series), breaks }
}

export function getAllSeries(): { sport: string; series: Series }[] {
  return getSportIds().flatMap((sport) =>
    getSeriesForSport(sport).map((series) => ({ sport, series })),
  )
}

/**
 * The laws in force for a sport, if a snapshot has been taken. Sections are
 * returned in the canonical order rather than file order, so two sports can be
 * read side by side without the sections drifting apart.
 */
export function getPlay(id: string): Play | null {
  const file = path.join(SPORTS, id, 'play.yaml')
  if (!fs.existsSync(file)) return null
  const play = parse<Play>(fs.readFileSync(file, 'utf8'))
  assertPlayIsClean(id, play)
  const order = (s: { id: string }) => {
    const i = LAW_SECTIONS.indexOf(s.id as (typeof LAW_SECTIONS)[number])
    return i === -1 ? LAW_SECTIONS.length : i
  }
  return { ...play, sections: [...play.sections].sort((a, b) => order(a) - order(b)) }
}

/**
 * Fails the build on the mistakes this file's shape invites. An unquoted comma
 * inside a flow mapping — `{ label: Width, doubles, value: 6.1 m }` — parses as
 * a second key and silently truncates the label, which shipped two facts both
 * labelled "Width" before this check existed.
 */
function assertPlayIsClean(sport: string, play: Play): void {
  for (const section of play.sections) {
    if (!LAW_SECTIONS.includes(section.id)) {
      throw new Error(
        `play.yaml (${sport}): section "${section.id}" is not one of the canonical sections`,
      )
    }
    const labels = new Set<string>()
    for (const fact of section.facts ?? []) {
      if (!fact.label || fact.value === undefined || fact.value === null) {
        throw new Error(
          `play.yaml (${sport}/${section.id}): a fact is missing a label or a value — check for an unquoted comma`,
        )
      }
      if (labels.has(fact.label)) {
        throw new Error(
          `play.yaml (${sport}/${section.id}): two facts are both labelled "${fact.label}"`,
        )
      }
      labels.add(fact.label)
    }
  }
}

export function getAllPlay(): { sport: string; play: Play }[] {
  return getSportIds()
    .map((sport) => ({ sport, play: getPlay(sport) }))
    .filter((x): x is { sport: string; play: Play } => x.play !== null)
}

/**
 * The learning curve for a sport. Every evidence item is checked for the thing
 * that would make this layer dishonest: an item claiming to rest on a rule
 * without naming one, which would let a judgement pass as sourced.
 */
export function getLearning(id: string): Learning | null {
  const file = path.join(SPORTS, id, 'learning.yaml')
  if (!fs.existsSync(file)) return null
  const learning = parse<Learning>(fs.readFileSync(file, 'utf8'))
  const ruleIds = new Set(getRuleChanges(id).map((r) => r.id))
  for (const axis of [learning.entry, learning.mastery]) {
    for (const e of axis.evidence) {
      if (e.basis === 'rule' && !e.rule) {
        throw new Error(
          `learning.yaml (${id}): "${e.label}" claims a rule basis but names no rule`,
        )
      }
      if (e.rule && !ruleIds.has(e.rule)) {
        throw new Error(
          `learning.yaml (${id}): "${e.label}" cites rule "${e.rule}", which this sport does not have`,
        )
      }
    }
  }
  return learning
}

export function getAllLearning(): { sport: string; learning: Learning }[] {
  return getSportIds()
    .map((sport) => ({ sport, learning: getLearning(sport) }))
    .filter((x): x is { sport: string; learning: Learning } => x.learning !== null)
}

export function getEvents(id: string): Events | null {
  const file = path.join(SPORTS, id, 'events.yaml')
  if (!fs.existsSync(file)) return null
  const events = parse<Events>(fs.readFileSync(file, 'utf8'))
  assertEventsAreStatused(id, events)
  return events
}

/**
 * Every event must say where it is contested. The field replaced a boolean,
 * and a boolean has a default — so an unchecked event looked exactly like one
 * checked and found to be non-Olympic. A list has no default, and this refuses
 * to let one be omitted or invented.
 */
function assertEventsAreStatused(sport: string, events: Events): void {
  for (const d of events.disciplines) {
    for (const e of d.events) {
      if (e.context) {
        if (e.at) {
          throw new Error(
            `events.yaml (${sport}/${d.id}): "${e.label}" is marked context and also given a status — pick one`,
          )
        }
        continue
      }
      if (!Array.isArray(e.at) || e.at.length === 0) {
        throw new Error(
          `events.yaml (${sport}/${d.id}): "${e.label}" has no "at" — say where it is contested, or say federation-only`,
        )
      }
      for (const status of e.at) {
        if (!CONTEST_STATUS.includes(status)) {
          throw new Error(
            `events.yaml (${sport}/${d.id}): "${e.label}" is contested at "${status}", which is not a known programme`,
          )
        }
      }
      if (e.at.includes('lapsed') && e.at.length > 1) {
        throw new Error(
          `events.yaml (${sport}/${d.id}): "${e.label}" is both lapsed and currently contested — lapsed means no current programme`,
        )
      }
    }
  }
}

/** MDX narrative sections for a sport, ordered by their numeric filename prefix. */
export function getSections(id: string): { slug: string; title: string; body: string }[] {
  const at = path.join(SPORTS, id)
  if (!fs.existsSync(at)) return []
  return fs.readdirSync(at)
    .filter((f) => f.endsWith('.mdx'))
    .sort()
    .map((f) => {
      const raw = fs.readFileSync(path.join(at, f), 'utf8')
      const heading = raw.match(/^#\s+(.+)$/m)
      return {
        slug: f.replace(/^\d+-/, '').replace(/\.mdx$/, ''),
        title: heading ? heading[1] : f,
        body: raw.replace(/^#\s+.+$\n?/m, '').trim(),
      }
    })
}

/** Every photograph on the site, with the attribution its licence requires. */
export function getImages(): SourcedImage[] {
  const file = path.join(CONTENT, 'images.yaml')
  if (!fs.existsSync(file)) return []
  const raw = parse<SourcedImage[]>(fs.readFileSync(file, 'utf8')) ?? []
  return raw.map((i) => ({ ...i, shows: i.shows.replace(/\s+/g, ' ').trim() }))
}

export function getImageForSport(sport: string): SourcedImage | undefined {
  return getImages().find((i) => i.sport === sport)
}
