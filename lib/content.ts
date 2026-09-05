import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type {
  Cause, Lens, Program, RuleChange, Series, Source, Sport,
} from './types'

const CONTENT = path.join(process.cwd(), 'content')
const SPORTS = path.join(CONTENT, 'sports')

function readYaml<T>(...parts: string[]): T {
  return yaml.load(fs.readFileSync(path.join(...parts), 'utf8')) as T
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
  const rules = yaml.load(fs.readFileSync(file, 'utf8')) as RuleChange[] | null
  return (rules ?? []).sort((a, b) => a.date_effective.localeCompare(b.date_effective))
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
    .map((f) => yaml.load(fs.readFileSync(path.join(at, f), 'utf8')) as Series)
}

export function getAllSeries(): { sport: string; series: Series }[] {
  return getSportIds().flatMap((sport) =>
    getSeriesForSport(sport).map((series) => ({ sport, series })),
  )
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
