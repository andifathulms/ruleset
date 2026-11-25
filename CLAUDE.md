# CLAUDE.md

Build instructions for Ruleset. Read PRD.md and DESIGN.md first.

Ruleset is an encyclopedia of sports: what each sport is, how it is played, and
why its rules are the way they are. How to play comes first on every page.
Rule changes are supporting material that explains the current law.

## Stack

- Next.js 14, App Router, `output: 'export'` — fully static
- Tailwind CSS
- D3 for the lane timeline and the series charts
- MDX for narrative sections
- GitHub Pages. **No backend, no database, no API routes, no runtime fetching.**

## Repository layout

```
/content
  /sports
    badminton/
      sport.yaml           # identity, tagline, summary, glance figures
      play.yaml            # walk-through, then the laws in force by clause
      field.yaml           # the playing area, drawn to scale (optional)
      glossary.yaml        # the sport's terms, linked from the essays
      events.yaml          # disciplines and events
      learning.yaml        # editorial learning curve
      rules.yaml           # every rule change
      series/
        rally-scoring.yaml # a series with its segments
      01-origin.mdx        # essays: a sport has the ones it has a story for
      02-equipment.mdx
      04-controversies.mdx
  programmes/              # skeleton layer: status per edition, per programme
  images.yaml              # every photograph, with credit and licence
  lenses.yaml              # the three classification schemes
  causes.yaml              # closed cause vocabulary + definitions
  sources.yaml             # every source, cited by id
/lib
  timeline.ts
  series.ts                # segment handling — see hard rules
  fieldSvg.ts              # draws field.yaml; shared by the page and the preview
/scripts
  check-sport.mjs          # validate one sport's content without a build
  field-preview.mjs        # render one sport's field.yaml to a PNG
```

## Data model

### sport.yaml

`tagline` is one sentence that says what the sport is to someone who has never
seen it. `summary` is a short paragraph on how it is played. `glance` is three
figures about the game itself (players, target score, size of the court).
None of the three talks about rule changes or about the rest of the site.

### play.yaml

`walkthrough` comes before the clauses: a title and four to seven steps that
follow one rally, attempt, bout or race from its start to the score changing.
It is written from the sport's own `sections` below it and adds no rule they
do not contain.

### field.yaml

The playing area as shapes in metres, drawn by `lib/fieldSvg.ts`. Every
measurement comes from a fact in the sport's play.yaml. A sport with no single
defined playing area has no field.yaml. `scale: schematic` marks a drawing
that is not to scale, and the page says so.

### glossary.yaml

Terms with an `id`, a `term` and a `definition`, and optionally `see`, the
play.yaml clause where the word is at work. Essays link a term with
`<Term id="…">word</Term>`. A link to a term that does not exist fails the
build.

### rules.yaml

```yaml
- id: bwf-2006-rally-scoring
  scope: { sport: badminton, discipline: all }
  date_adopted: 2005-12
  date_effective: 2006-02-01
  governing_body: BWF
  what_changed: >
    Replaced 15-point side-out scoring with 21-point rally scoring, best of
    three games. A point is scored on every rally regardless of service.
  cause_primary: broadcast and pacing
  cause_secondary: commercial
  trigger:
    description: >
      Match length under side-out scoring was unpredictable, which made
      broadcast scheduling difficult.
    source: ...
  citation: { source: bwf-laws-2006, article: "7.1" }
  comparability_break: badminton-match-stats
```

### series/*.yaml

```yaml
id: javelin-mens-wr
label: Men's javelin world record
unit: m
segments:
  - id: pre-1986
    from: 1912
    to: 1986
    points: [ { year: 1984, value: 104.80, holder: Uwe Hohn, source: ... } ]
  - id: post-1986
    from: 1986
    to: null
    points: [ ... ]
break:
  at: 1986
  caused_by: wa-1986-javelin-redesign
  kind: reset            # reset | scale-change | retained | none
  note: >
    Implement redesigned to shift the centre of gravity; the record book was
    restarted. Distances across this break are not comparable.
```

`kind` values, all four of which appear in v1:

- `reset` — records restarted (javelin, 1986)
- `retained` — the rule changed but old marks were allowed to stand
  (swimming supersuits, 2010)
- `scale-change` — the measurement scale itself changed, so no mapping exists
  (gymnastics Code of Points, 2006)
- `scoped` — no series exists for the sport as a whole; the series belongs to one
  named competition (football goals per game)

Two more appear in the data: `unified` (two lists merged into one) and `none`
(a rule change that left the series intact, recorded so the absence is a
finding).

## Hard rules

1. **Never draw a line across a break.** Segments render as separate paths with a
   visible discontinuity. No interpolation, no trend line spanning a break, no
   axis that implies continuity. This is the entire point of the feature.

2. **Never invent a citation.** Every rule change needs a real rulebook edition
   and article, or minutes, or a governing-body circular. No plausible
   placeholders. Missing source means the entry renders as incomplete.

3. **Never infer a cause.** `cause_primary` comes from a stated reason or a
   sourced account. If sources disagree, use `disputed` and record both. A
   governing body's stated reason and the widely-believed reason may differ —
   record both rather than choosing.

4. **Never present a scoped series as the sport's series.** Football's goals per
   game is labelled with its competition everywhere it appears, in the chart
   title itself, not in a footnote.

5. **Where a series cannot exist, say so in place of the chart.** Gymnastics
   post-2006 gets a written explanation where the chart would be, styled as
   content and not as an error.

6. **The skeleton layer never borrows the deep layer's authority.** Sports with
   no rule research show status and classification only, and are visibly marked
   as not yet covered.

7. **How-to-play content adds no unsourced history.** The walk-through, the
   glossary and the field diagram describe the laws in force and are written
   from play.yaml. They carry no dates, causes or people. A new measurement
   goes into play.yaml as a fact first, under that file's standing.

8. **Never invent a quotation.** A direct quote needs a source like any other
   claim.

## Writing

- Lead with the sport. The first sentence of a tagline, summary or essay says
  something about the game, not about this site or the other sports on it.
  Do not write "the only sport on this site that…" or "in this collection".
- Plain words and short sentences. Define a term in the glossary and link it.
- Essays vary. Merge or drop an essay that has no story of its own; do not pad
  one to match another sport. File slugs stay within origin, equipment,
  politics, controversies, officiating, geography, contested, because the
  page places essays by slug.
- Tell an incident as a scene where the recorded facts allow it.
- Link, do not just compare: `[football](/sports/football/)` for another
  sport, `[the 2006 change](#rule-id)` for a rule change on the same page.
- Never nest a `<Term>` inside a markdown link.

## Timeline behaviour

- One lane per family under the active classification lens; switching lenses
  regroups the lanes rather than recolouring marks in place.
- Marks are shaped by `cause_primary` and coloured by family (DESIGN.md).
  Filter by cause, by lens group, by date range.
- Comparability breaks render on the lane as an actual break in the lane line —
  see DESIGN.md. They are the only element allowed to interrupt a lane.
- Clicking a mark opens the rule change; it does not navigate away from the
  timeline.

## Content workflow

One sport at a time, one rulebook at a time. Open the actual source, enter its
rule changes, then move on. Do not populate four sports in one pass from general
knowledge — that is how unsourced causes and confident wrong dates enter.

Run `node scripts/check-sport.mjs <sport>` after editing a sport. It checks the
YAML, the glossary and photo references, the links and the MDX without a full
build. `node scripts/field-preview.mjs <sport>` renders field.yaml to a PNG so
a diagram can be looked at before it ships.

## Quality floor

Responsive to mobile, including the timeline — it becomes vertical, not a
horizontally scrolling desktop layout shrunk down. Visible keyboard focus.
`prefers-reduced-motion` respected. Charts readable without colour alone.
