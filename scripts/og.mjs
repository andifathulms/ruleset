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

/* The bright end of each family's colour, which is the pairing the site uses
   for a mark on the ink background. */
const FAMILY = {
  pool: '#57ACE8',
  pitch: '#5CC684',
  clay: '#EA7E4E',
  gold: '#F2C94F',
  unmarked: '#9FB2B0',
}

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
      style: { display: 'flex', width: 1040, height: 32, alignItems: 'flex-end', marginTop: 36 },
      children: [
        { type: 'div', props: { style: { display: 'flex', width: 400, height: 2, background: CHALK, opacity: 0.3 } } },
        { type: 'div', props: { style: { display: 'flex', width: 26, height: 2 } } },
        { type: 'div', props: { style: { display: 'flex', width: 2, height: 30, background: colour, opacity: 0.9 } } },
        { type: 'div', props: { style: { display: 'flex', width: 26, height: 2 } } },
        { type: 'div', props: { style: { display: 'flex', flexGrow: 1, height: 2, background: colour, opacity: 0.9, marginBottom: 28 } } },
      ],
    },
  }
}

/**
 * One card. `eyebrow` names what the page is, `title` is the page, `note` is
 * the one line a reader gets in a chat app before deciding to open it.
 */
function Card({ eyebrow, title, note, footer, colour }) {
  // A tagline runs long, and a card that overflows its 630px crops mid-word
  // in the preview. The type steps down instead, and the footer is pushed to
  // the bottom by the flow rather than pinned over it.
  const titleSize = title.length > 30 ? 76 : title.length > 20 ? 88 : 104
  const noteSize = note.length > 150 ? 25 : note.length > 100 ? 27 : 30

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
        padding: '64px 80px 60px',
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
                  style: {
                    display: 'flex', fontSize: 23, letterSpacing: 5, fontWeight: 600, color: colour,
                    textTransform: 'uppercase',
                  },
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
              display: 'flex', fontFamily: 'Archivo', fontWeight: 700, fontSize: titleSize,
              lineHeight: 1.04, marginTop: 24, letterSpacing: -2, maxWidth: 1000,
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontSize: noteSize, lineHeight: 1.4, color: DIM, marginTop: 24, maxWidth: 920 },
            children: note,
          },
        },
        { type: 'div', props: { style: { display: 'flex', flexGrow: 1 } } },
        SteppedRule({ colour }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', fontSize: 24, color: DIM, marginTop: 26 },
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
  const sports = sportIds().map((id) => {
    const sport = { ...readYaml('sports', id, 'sport.yaml'), id }

    const rulesFile = path.join(CONTENT, 'sports', id, 'rules.yaml')
    sport.rules = fs.existsSync(rulesFile) ? (readYaml('sports', id, 'rules.yaml') ?? []).length : 0

    const seriesDir = path.join(CONTENT, 'sports', id, 'series')
    // A series file carries a `breaks` list; the single-break form in the
    // docs is accepted too, so the count does not depend on which was used.
    sport.breaks = !fs.existsSync(seriesDir)
      ? 0
      : fs.readdirSync(seriesDir)
          .map((file) => readYaml('sports', id, 'series', file))
          .flatMap((series) => series?.breaks ?? (series?.break ? [series.break] : []))
          .filter((b) => b.kind !== 'none')
          .length

    return sport
  })

  const deep = sports.filter((s) => s.coverage === 'deep')
  const rules = deep.reduce((total, s) => total + s.rules, 0)
  const breaks = deep.reduce((total, s) => total + s.breaks, 0)

  // The skeleton layer lives in the programmes rather than in /content/sports,
  // so the count of sports carried as status only comes from there.
  const programmes = ['olympic', 'asian-games', 'world-games'].map((p) => readYaml('programmes', `${p}.yaml`))
  const skeleton = new Set(
    programmes.flatMap((p) => (p.sports ?? []).filter((s) => s.coverage === 'skeleton').map((s) => s.id)),
  )

  return {
    list: sports,
    sports: sports.length,
    skeleton: skeleton.size,
    deep: deep.length,
    rules,
    breaks,
    sources: (readYaml('sources.yaml') ?? []).length,
    programmes: programmes.length,
  }
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

/** Satori returns a stream; a file on disk is what the scrapers need. */
async function write(name, element, size = SIZE) {
  const png = Buffer.from(await new ImageResponse(element, { ...size, fonts }).arrayBuffer())
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
      note: `${plural(n.deep, 'sport researched', 'sports researched')} rule by rule, and ${n.skeleton} more carried as status data and marked as such.`,
      footer: `${n.sports + n.skeleton} sports`,
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

  /*
    One card per sport. This is the link people actually send each other, and
    until now it arrived with nothing attached. The eyebrow names the body
    that writes the laws, the note is the sport's own tagline, and the footer
    says how much of it has been researched — so a reader can tell a
    researched sport from a thin one before opening the page.
  */
  fs.mkdirSync(path.join(OUT, 'sports'), { recursive: true })
  for (const sport of n.list) {
    const researched = sport.coverage === 'deep' && sport.rules > 0
    const footer = !researched
      ? 'Not yet researched'
      : sport.breaks > 0
        ? `${plural(sport.rules, 'rule change', 'rule changes')} · ${plural(sport.breaks, 'break', 'breaks')}`
        : plural(sport.rules, 'rule change', 'rule changes')

    await write(
      `sports/${sport.id}`,
      Card({
        eyebrow: sport.governing_body ?? 'Rule changes',
        title: sport.label,
        note: (sport.tagline ?? '').trim(),
        footer,
        colour: FAMILY[sport.family_colour] ?? CHALK,
      }),
    )
    count += 1
  }

  /*
    The touch icon, drawn from the same mark as app/icon.svg. It lives beside
    the cards because both are build output: iOS wants a PNG at 180px and
    will not take the SVG the browsers use.
  */
  await write(
    'apple-touch-icon',
    {
      type: 'div',
      props: {
        style: { display: 'flex', width: '100%', height: '100%', background: INK, alignItems: 'center', justifyContent: 'center' },
        children: {
          type: 'div',
          props: {
            style: { display: 'flex', width: 124, height: 64, alignItems: 'flex-end' },
            children: [
              { type: 'div', props: { style: { display: 'flex', width: 54, height: 10, background: CHALK } } },
              { type: 'div', props: { style: { display: 'flex', width: 10, height: 64, background: CHALK } } },
              { type: 'div', props: { style: { display: 'flex', width: 54, height: 10, background: CHALK, marginBottom: 54 } } },
            ],
          },
        },
      },
    },
    { width: 180, height: 180 },
  )
  count += 1

  console.log(`og: wrote ${count} card${count === 1 ? '' : 's'} to public/og`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
