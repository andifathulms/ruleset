/*
  Checks one sport's content without a build: node scripts/check-sport.mjs badminton
  (or several, or --all). It reads the same files the loaders in lib/content.ts
  read and fails on the mistakes that are cheap to make while writing: a YAML
  field that did not parse as text, a glossary link to a term that is not
  there, a photograph that an essay no longer places, a link to a rule or a
  sport that does not exist, and the phrases CLAUDE.md asks essays not to use.
  The build remains the final check; this one is fast and safe to run while
  other sports are being edited.
*/
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { compile } from '@mdx-js/mdx'

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const SPORTS = path.join(ROOT, 'content', 'sports')
const load = (file) => yaml.load(fs.readFileSync(file, 'utf8'), { schema: yaml.CORE_SCHEMA })

const SLUGS = ['origin', 'equipment', 'politics', 'controversies', 'officiating', 'geography', 'contested']
const LAW_SECTIONS = ['object', 'field', 'equipment', 'players', 'duration', 'scoring', 'restarts', 'prohibitions', 'winning']
const BANNED = [/\bon this site\b/i, /\bin this collection\b/i, /\bcovered here\b/i, /\bthis site\b/i]
const PAGE_ANCHORS = new Set(['play', 'walkthrough', 'events', 'glossary', 'learning', 'rules', 'series', ...SLUGS])

const images = load(path.join(ROOT, 'content', 'images.yaml')) ?? []
const allSports = fs.readdirSync(SPORTS).filter((d) => fs.existsSync(path.join(SPORTS, d, 'sport.yaml')))

async function check(sport) {
  const dir = path.join(SPORTS, sport)
  const errors = []
  const warn = []
  const err = (m) => errors.push(m)
  const text = (v) => typeof v === 'string' && v.trim().length > 0
  const read = (name) => {
    const file = path.join(dir, name)
    if (!fs.existsSync(file)) return null
    try { return load(file) } catch (e) { err(`${name}: does not parse — ${e.message.split('\n')[0]}`); return null }
  }

  // sport.yaml
  const s = read('sport.yaml')
  if (s) {
    for (const k of ['tagline', 'summary']) {
      if (!text(s[k])) err(`sport.yaml: "${k}" is missing or did not parse as text (quote a value containing ": ")`)
      else for (const b of BANNED) if (b.test(s[k])) err(`sport.yaml: "${k}" contains "${s[k].match(b)[0]}"`)
    }
    if (text(s.tagline) && s.tagline.length > 170) err(`sport.yaml: tagline is ${s.tagline.length} characters; keep it under 170`)
    if (!Array.isArray(s.glance) || s.glance.length !== 3) err('sport.yaml: "glance" must be exactly three { value, label } figures')
    else for (const g of s.glance) {
      if (!text(g.value) || !text(g.label)) err('sport.yaml: every glance figure needs a quoted text value and a label')
      else if (g.value.length > 9) err(`sport.yaml: glance value "${g.value}" is too long for the header; nine characters at most`)
    }
  }

  // play.yaml
  const play = read('play.yaml')
  const clauses = new Set((play?.sections ?? []).map((x) => x.id))
  if (play) {
    for (const id of clauses) if (!LAW_SECTIONS.includes(id)) err(`play.yaml: unknown section "${id}"`)
    const w = play.walkthrough
    if (!w) err('play.yaml: no walkthrough')
    else {
      if (!text(w.title)) err('play.yaml: walkthrough has no title')
      if (!Array.isArray(w.steps) || w.steps.length < 4 || w.steps.length > 7) err('play.yaml: walkthrough needs four to seven steps')
      else for (const st of w.steps) if (!text(st.label) || !text(st.body)) err('play.yaml: a walkthrough step is missing a text label or body')
    }
    for (const sec of play.sections ?? []) {
      for (const f of sec.facts ?? []) if (!f.label || f.value === undefined || f.value === null) err(`play.yaml (${sec.id}): a fact is missing a label or value`)
    }
  }

  // rules, series, others must still parse
  const rules = read('rules.yaml') ?? []
  const ruleIds = new Set(rules.map((r) => r.id))
  read('learning.yaml'); read('events.yaml')
  const seriesIds = new Set()
  const sdir = path.join(dir, 'series')
  if (fs.existsSync(sdir)) for (const f of fs.readdirSync(sdir)) { const x = read(path.join('series', f)); if (x?.id) seriesIds.add(x.id) }

  // glossary.yaml
  const glossary = read('glossary.yaml')
  const termIds = new Set()
  if (!glossary) err('glossary.yaml: missing')
  else {
    if (!Array.isArray(glossary.terms) || glossary.terms.length < 6) err('glossary.yaml: needs at least six terms')
    for (const t of glossary.terms ?? []) {
      if (!/^[a-z0-9-]+$/.test(t.id ?? '')) err(`glossary.yaml: bad id "${t.id}"`)
      if (termIds.has(t.id)) err(`glossary.yaml: duplicate id "${t.id}"`)
      termIds.add(t.id)
      if (!text(t.term) || !text(t.definition)) err(`glossary.yaml: "${t.id}" is missing a text term or definition`)
      if (t.see && !clauses.has(t.see)) err(`glossary.yaml: "${t.id}" points at clause "${t.see}", which play.yaml does not have`)
    }
  }

  // field.yaml: the loader is the strict check; here only that it parses
  const field = read('field.yaml')
  if (field && (!text(field.title) || !text(field.caption) || !text(field.alt))) err('field.yaml: title, caption and alt must all be text')

  // essays
  const mine = images.filter((i) => i.sport === sport)
  const photoIds = new Set(mine.map((i) => i.id))
  const placed = new Set()
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort()
  if (!files.some((f) => f.replace(/^\d+-/, '') === 'origin.mdx')) err('no origin essay')
  let termLinks = 0
  for (const f of files) {
    const slug = f.replace(/^\d+-/, '').replace(/\.mdx$/, '')
    if (!SLUGS.includes(slug)) err(`${f}: slug "${slug}" is not one the page places`)
    const raw = fs.readFileSync(path.join(dir, f), 'utf8')
    if (!/^#\s+.+$/m.test(raw)) err(`${f}: no "# Title" line`)
    try { await compile(raw) } catch (e) { err(`${f}: MDX does not compile — ${String(e.message).split('\n')[0]}`) }
    for (const b of BANNED) { const m = raw.match(b); if (m) err(`${f}: contains "${m[0]}"`) }
    for (const m of raw.matchAll(/<Term\s+id="([^"]+)"/g)) { termLinks++; if (!termIds.has(m[1])) err(`${f}: <Term id="${m[1]}"> is not in glossary.yaml`) }
    if (/<Term\b(?![^>]*\bid=")/.test(raw)) err(`${f}: a <Term> has no id`)
    for (const m of raw.matchAll(/<Photo\s+id="([^"]+)"/g)) { placed.add(m[1]); if (!photoIds.has(m[1])) err(`${f}: photo "${m[1]}" is not one of this sport's`) }
    for (const m of raw.matchAll(/<Photos\s+ids="([^"]+)"/g)) for (const id of m[1].split(/\s+/).filter(Boolean)) { placed.add(id); if (!photoIds.has(id)) err(`${f}: photo "${id}" is not one of this sport's`) }
    if (/\[[^\]]*<Term[^\]]*\]\(/.test(raw.replace(/\n/g, ' '))) err(`${f}: a <Term> is nested inside a markdown link`)
    for (const m of raw.replace(/\n/g, ' ').matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1]
      if (href.startsWith('#')) {
        const id = href.slice(1)
        const ok = ruleIds.has(id) || seriesIds.has(id) || PAGE_ANCHORS.has(id) ||
          (id.startsWith('term-') && termIds.has(id.slice(5))) || (id.startsWith('law-') && clauses.has(id.slice(4)))
        if (!ok) err(`${f}: link to "${href}" matches no rule, series, term or section on this page`)
      } else if (href.startsWith('/')) {
        const m2 = href.match(/^\/sports\/([a-z0-9-]+)\/(#[\w-]+)?$/)
        if (!m2 && !/^\/(sports|play|breaks|program|sources|about)\/$/.test(href)) err(`${f}: internal link "${href}" is not a page (sport links are /sports/<id>/ with the trailing slash)`)
        else if (m2 && !allSports.includes(m2[1])) err(`${f}: links to sport "${m2[1]}", which does not exist`)
      } else if (!/^https?:\/\//.test(href)) err(`${f}: link "${href}" is neither internal nor http(s)`)
    }
  }
  for (const i of mine) {
    if (!i.slot && i.id !== s?.cover && !placed.has(i.id)) err(`photo "${i.id}" has no slot and no essay places it any more — put it back with <Photo id="${i.id}" />`)
  }
  if (termLinks < 3) warn.push(`only ${termLinks} glossary links across the essays`)

  return { sport, errors, warn }
}

const args = process.argv.slice(2)
const targets = args.includes('--all') ? allSports : args
if (targets.length === 0) { console.error('usage: node scripts/check-sport.mjs <sport> [...] | --all'); process.exit(2) }
let failed = 0
for (const sport of targets) {
  if (!allSports.includes(sport)) { console.error(`${sport}: no such sport`); failed++; continue }
  const { errors, warn } = await check(sport)
  for (const w of warn) console.log(`${sport}: note — ${w}`)
  if (errors.length) { failed++; for (const e of errors) console.error(`${sport}: ${e}`) }
  else console.log(`${sport}: ok`)
}
process.exit(failed ? 1 : 0)
