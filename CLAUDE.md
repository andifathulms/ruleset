# CLAUDE.md

Build instructions for Ruleset. Read PRD.md and DESIGN.md first.

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
      sport.yaml           # identity, governing body, classification
      rules.yaml           # every rule change
      series/
        rally-scoring.yaml # a series with its segments
      01-origin.mdx
      02-equipment.mdx
      03-politics.mdx
      04-controversies.mdx
  program.yaml             # skeleton layer: Olympic status per edition
  lenses.yaml              # the three classification schemes
  causes.yaml              # closed cause vocabulary + definitions
  sources.yaml             # every source, cited by id
/lib
  timeline.ts
  series.ts                # segment handling — see hard rules
```

## Data model

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

## Timeline behaviour

- One lane per family under the active classification lens; switching lenses
  regroups the lanes rather than recolouring marks in place.
- Marks coloured by `cause_primary`. Filter by cause, by lens group, by date
  range.
- Comparability breaks render on the lane as an actual break in the lane line —
  see DESIGN.md. They are the only element allowed to interrupt a lane.
- Clicking a mark opens the rule change; it does not navigate away from the
  timeline.

## Content workflow

One sport at a time, one rulebook at a time. Open the actual source, enter its
rule changes, then move on. Do not populate four sports in one pass from general
knowledge — that is how unsourced causes and confident wrong dates enter.

Start with the skeleton layer: `program.yaml` is a data-entry task with no
research and it makes the site usable before any deep sport is finished.

## Quality floor

Responsive to mobile, including the timeline — it becomes vertical, not a
horizontally scrolling desktop layout shrunk down. Visible keyboard focus.
`prefers-reduced-motion` respected. Charts readable without colour alone.
