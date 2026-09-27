/*
  Builds the social card images into /public/og.

  These are generated rather than committed: the card for a sport carries that
  sport's tagline and its rule count, both of which come from /content and
  would otherwise drift out of date silently. Run by `prebuild`, so a deploy
  cannot ship a card that disagrees with the page it points at.

  Everything is drawn here rather than by Next's opengraph-image convention
  because a static export writes that route out as a file with no extension,
  and GitHub Pages then serves it with a content type no scraper accepts.
  A real .png on disk works everywhere.
*/
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { ImageResponse } from 'next/og.js'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'og')
const FONTS = path.join(ROOT, 'assets', 'fonts')

const SIZE = { width: 1200, height: 630 }

const INK = '#041317'
const CHALK = '#F2F5F1'
const DIM = '#9FB2B0'

const font = (file) => fs.readFileSync(path.join(FONTS, file))

const fonts = [
  { name: 'Archivo', data: font('Archivo-Bold.ttf'), weight: 700, style: 'normal' },
  { name: 'Plex', data: font('IBMPlexSans-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Plex', data: font('IBMPlexSans-SemiBold.ttf'), weight: 600, style: 'normal' },
]

/** The site's argument as a hairline: a line that runs level, then steps. */
function SteppedRule({ colour }) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', position: 'absolute', left: 80, right: 0, bottom: 150, height: 34, alignItems: 'flex-end' },
      children: [
        { type: 'div', props: { style: { display: 'flex', width: 430, height: 2, background: CHALK, opacity: 0.3 } } },
        { type: 'div', props: { style: { display: 'flex', width: 26, height: 2 } } },
        { type: 'div', props: { style: { display: 'flex', width: 2, height: 32, background: colour, opacity: 0.9 } } },
        { type: 'div', props: { style: { display: 'flex', width: 26, height: 2 } } },
        { type: 'div', props: { style: { display: 'flex', flexGrow: 1, height: 2, background: colour, opacity: 0.9, marginBottom: 30 } } },
      ],
    },
  }
}

/**
 * One card. `eyebrow` names what the page is, `title` is the page, `note` is
 * the one line a reader gets in a chat app before deciding to open it.
 */
function Card({ eyebrow, title, note, footer, colour }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: INK,
        color: CHALK,
        fontFamily: 'Plex',
        padding: '72px 80px',
        position: 'relative',
      },
      children: [
        // The mark and the eyebrow carry the accent: a sport card takes its
        // family colour, every other card the house chalk.
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 20 },
            children: [
              { type: 'div', props: { style: { display: 'flex', width: 18, height: 18, background: colour } } },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 24, letterSpacing: 6, fontWeight: 600, color: colour, textTransform: 'uppercase' },
                  children: eyebrow,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', fontFamily: 'Archivo', fontWeight: 700, fontSize: title.length > 26 ? 84 : 104,
              lineHeight: 1.04, marginTop: 26, letterSpacing: -2, maxWidth: 980,
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontSize: 30, lineHeight: 1.42, color: DIM, marginTop: 28, maxWidth: 900 },
            children: note,
          },
        },
        SteppedRule({ colour }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', position: 'absolute', left: 80, right: 80, bottom: 64, justifyContent: 'space-between', fontSize: 24, color: DIM },
            children: [
              { type: 'div', props: { style: { display: 'flex', fontWeight: 600, color: CHALK }, children: 'Ruleset' } },
              { type: 'div', props: { style: { display: 'flex' }, children: footer } },
            ],
          },
        },
      ],
    },
  }
}

/*
  The counts a card prints come from /content, read here directly rather than
  through lib/content.ts: this script runs before the TypeScript build, and a
  card that quotes a stale number is worse than one that quotes none.
*/
const CONTENT = path.join(ROOT, 'content')

const readYaml = (...parts) =>
  yaml.load(fs.readFileSync(path.join(CONTENT, ...parts), 'utf8'), { schema: yaml.CORE_SCHEMA })

const sportIds = () =>
  fs.readdirSync(path.join(CONTENT, 'sports'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

function tally() {
  const sports = sportIds().map((id) => ({ ...readYaml('sports', id, 'sport.yaml'), id }))
  const deep = sports.filter((s) => s.coverage === 'deep')

  let rules = 0
  let breaks = 0
  for (const s of deep) {
    const rulesFile = path.join(CONTENT, 'sports', s.id, 'rules.yaml')
    if (fs.existsSync(rulesFile)) rules += (readYaml('sports', s.id, 'rules.yaml') ?? []).length

    const seriesDir = path.join(CONTENT, 'sports', s.id, 'series')
    if (!fs.existsSync(seriesDir)) continue
    for (const file of fs.readdirSync(seriesDir)) {
      const series = readYaml('sports', s.id, 'series', file)
      if (series?.break && series.break.kind !== 'none') breaks += 1
    }
  }

  const programmes = ['olympic', 'asian-games', 'world-games'].map((p) => readYaml('programmes', `${p}.yaml`))

  return {
    sports: sports.length,
    deep: deep.length,
    rules,
    breaks,
    sources: (readYaml('sources.yaml') ?? []).length,
    programmes: programmes.length,
  }
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

/** Satori returns a stream; a file on disk is what the scrapers need. */
async function write(name, element) {
  const png = Buffer.from(await new ImageResponse(element, { ...SIZE, fonts }).arrayBuffer())
  fs.writeFileSync(path.join(OUT, `${name}.png`), png)
  return png.length
}

/**
 * One card per page, keyed by the file name the page's metadata asks for.
 * The note is what somebody reads in a chat window before deciding whether
 * to open the link, so it says what the page holds rather than repeating the
 * title back at them.
 */
function pages(n) {
  return {
    default: {
      eyebrow: 'A record of rule changes',
      title: 'How sports became the sports they are',
      note: 'Every change with a cause, a date, a citation, and what it did to the numbers.',
      footer: 'Nothing interpolated across a break',
    },
    sports: {
      eyebrow: 'The record',
      title: 'Sports',
      note: `${plural(n.deep, 'sport researched', 'sports researched')} rule by rule; the other ${n.sports - n.deep} carried as status data and marked as such.`,
      footer: `${n.sports} sports`,
    },
    breaks: {
      eyebrow: 'Where the numbers stop',
      title: 'Comparability breaks',
      note: 'Rule changes that severed a series, and what each governing body did about the record book.',
      footer: plural(n.breaks, 'break', 'breaks'),
    },
    program: {
      eyebrow: 'The skeleton layer',
      title: 'The programmes',
      note: 'Olympic, Asian Games and World Games status for every sport, edition by edition.',
      footer: 'Status data only',
    },
    play: {
      eyebrow: 'The laws in force',
      title: 'How the games are played',
      note: 'The current laws for each covered sport, and the same clause read across all of them.',
      footer: `${plural(n.deep, 'sport', 'sports')}, clause by clause`,
    },
    sources: {
      eyebrow: 'Citations and standing',
      title: 'Sources',
      note: 'Every source cited, with how far each citation has actually been checked against the document.',
      footer: plural(n.sources, 'source', 'sources'),
    },
    about: {
      eyebrow: 'Method',
      title: 'What this refuses to do',
      note: 'What counts as a fact here, what will not be drawn, and where the collection is incomplete.',
      footer: `${plural(n.rules, 'rule change', 'rule changes')} recorded`,
    },
  }
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  const n = tally()
  let count = 0

  for (const [name, spec] of Object.entries(pages(n))) {
    await write(name, Card({ ...spec, colour: CHALK }))
    count += 1
  }

  console.log(`og: wrote ${count} card${count === 1 ? '' : 's'} to public/og`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
