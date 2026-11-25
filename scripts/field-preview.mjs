/*
  Renders one sport's field.yaml to a PNG so the drawing can be looked at
  before it ships: node scripts/field-preview.mjs volleyball [out-dir]

  It transpiles lib/fieldSvg.ts on the fly and calls the same function the
  sport page calls, so what this shows is what the page draws. The screenshot
  needs a Chromium: set CHROME to a binary, or have Playwright's headless
  shell in its usual cache. Without one it still writes the HTML.
*/
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import yaml from 'js-yaml'
import ts from 'typescript'

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const sport = process.argv[2]
if (!sport) { console.error('usage: node scripts/field-preview.mjs <sport> [out-dir]'); process.exit(2) }
const out = process.argv[3] ?? fs.mkdtempSync(path.join(os.tmpdir(), 'field-'))
fs.mkdirSync(out, { recursive: true })

const source = fs.readFileSync(path.join(ROOT, 'lib', 'fieldSvg.ts'), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText
const mod = path.join(out, `fieldSvg-${process.pid}.mjs`)
fs.writeFileSync(mod, js)
const { fieldSvg } = await import(mod)
fs.rmSync(mod)

const spec = yaml.load(fs.readFileSync(path.join(ROOT, 'content', 'sports', sport, 'field.yaml'), 'utf8'), { schema: yaml.CORE_SCHEMA })
const family = yaml.load(fs.readFileSync(path.join(ROOT, 'content', 'sports', sport, 'sport.yaml'), 'utf8'), { schema: yaml.CORE_SCHEMA }).family_colour
const BRIGHT = { pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0' }
const svg = fieldSvg(spec, BRIGHT[family] ?? BRIGHT.unmarked)

const [l, t, r, b] = spec.view
const width = 760
const height = Math.ceil((b - t) / (r - l) * (width - 80)) + 150
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#07191d;font-family:system-ui,sans-serif;color:#F2F5F1">
<div style="padding:28px 40px"><p style="margin:0 0 14px;font-size:20px">${spec.title} <span style="color:#9FB2B0;font-size:14px">· ${spec.scale}</span></p>${svg}
<p style="font-size:13px;color:#9FB2B0;max-width:640px">${(spec.legend ?? []).map((x) => `[${x.swatch}] ${x.label}`).join(' · ')}</p></div>`
const htmlFile = path.join(out, `${sport}-field.html`)
fs.writeFileSync(htmlFile, html)

function chrome() {
  if (process.env.CHROME) return process.env.CHROME
  const cache = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
  const linux = path.join(os.homedir(), '.cache', 'ms-playwright')
  for (const base of [cache, linux]) {
    if (!fs.existsSync(base)) continue
    for (const d of fs.readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell')).sort().reverse()) {
      for (const sub of fs.readdirSync(path.join(base, d))) {
        const bin = path.join(base, d, sub, 'chrome-headless-shell')
        if (fs.existsSync(bin)) return bin
      }
    }
  }
  return null
}

const bin = chrome()
if (!bin) { console.log(`no Chromium found; wrote ${htmlFile}`); process.exit(0) }
const png = path.join(out, `${sport}-field.png`)
execFileSync(bin, ['--disable-gpu', '--hide-scrollbars', `--window-size=${width},${height}`, `--screenshot=${png}`, `file://${htmlFile}`], { stdio: 'ignore' })
console.log(png)
