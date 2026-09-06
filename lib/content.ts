import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type {
  Cause, Lens, Play, Program, RuleChange, Series, Source, SourcedImage, Sport,
} from './types'
import { LAW_SECTIONS } from './types'

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
export const getProgram = (): Program => readYaml<Program>(CONTENT, 'program.yaml')

export const getSourceMap = (): Record<string, Source> =>
  Object.fromEntries(getSources().map((s) => [s.id, s]))

export const getCauseMap = (): Record<string, Cause> =>
  Object.fromEntries(getCauses().map((c) => [c.id, c]))

/** Every sport directory under /content/sports, deep or not. */
export function getSportIds(): string[] {
  return dirs(SPORTS)
}

export function getSport(id: string): Sport {
  return readYaml<Sport>(SPORTS, id, 'sport.yaml')
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
      date_effective: asDate(r.date_effective),
      date_adopted: r.date_adopted ? asDate(r.date_adopted) : undefined,
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
    .map((f) => parse<Series>(fs.readFileSync(path.join(at, f), 'utf8')))
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
