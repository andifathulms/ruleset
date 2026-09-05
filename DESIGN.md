# DESIGN.md — Ruleset

## The idea

Every sport is defined by white lines painted on a coloured surface. Court lines,
lane markings, the pitch, the floor boundary — that is the native visual grammar
of sports rules, and it is what this site is built from.

So: **white line-work on painted surfaces.** The lane is the primary structure,
the mark on the lane is the rule change, and the one memorable move is that a
**comparability break is drawn as a break in the line itself** — the lane stops,
offsets vertically, and restarts. A discontinuous series looks discontinuous. It
is the site's whole argument rendered as a single graphic gesture.

Nothing else on the page is allowed to break a line.

## Colour

Drawn from actual playing surfaces, and carrying information rather than
decorating. Each family owns a surface colour, so colour tells you which kind of
sport you're looking at before you read anything.

| Token | Hex | Job |
|---|---|---|
| `surface` | `#0B2B30` | Deep court teal. The ground everything is painted on. |
| `chalk` | `#F2F5F1` | Line white, very slightly cool. All rules, all lines. |
| `pool` | `#1D6FA8` | Measured sports — athletics, swimming. |
| `pitch` | `#2F7D4F` | Invasion sports — football, basketball, hockey. |
| `clay` | `#B7502A` | Racket sports — the clay court. |
| `gold` | `#C8A02C` | Judged sports — the floor, and the vanished Perfect 10. |
| `unmarked` | `#7A8C8A` | Gaps, uncovered sports, disputed causes. |

Four hues that are genuinely distinct at a glance, which matters because the
timeline puts all four families on screen at once. `unmarked` is deliberately
desaturated so an incomplete entry reads as quiet rather than broken.

Cause categories are distinguished by **mark shape**, not by a fifth through
twelfth colour — colour is already carrying family. Safety is a filled square,
broadcast a triangle, dominance suppression a diamond, and so on, with a legend
that stays on screen.

## Type

**Archivo Condensed** for headings, years, and all numerals. Condensed grotesque
is the actual vernacular of scoreboards and lane numbers, so it belongs here for
a reason rather than as a style choice. Years on the timeline are set large.

**IBM Plex Sans** for body. Humanist enough to read at length, neutral enough not
to fight the condensed display face, and clearly a different voice.

Body 17px/1.6, measure capped at 70 characters. Sentence case throughout. No
all-caps labels, no eyebrows above headings, no monospace for data.

## Layout

```
CROSS-SPORT TIMELINE — the landing view

        1970        1980        1990        2000        2010        2020
  ┌───────────────────────────────────────────────────────────────────────┐
  │                                                                       │
racket ────────────────────────────▲──────────────╫────────────────────── │
                              table tennis     badminton
                              11 points        rally scoring
                                                  ↑ break
measured ──────────────╫─────────────────────────────────╫────────────── │
                    javelin                            supersuits
                    redesign                           banned, records kept
                       ↑ break                            ↑ no break
invasion ────────────────────────╫─────────────────────────────────────── │
                              back-pass rule
                                 ↑ break (Premier League only)
judged ──────────────────────────────────────────╫─────────────────────── │
                                              Code of Points
                                                 ↑ scale change
  └───────────────────────────────────────────────────────────────────────┘
        ■ safety   ▲ broadcast   ◆ dominance   ● equipment   ○ disputed
```

Lanes are painted in the family colour at low opacity with a `chalk` centre line.
`╫` marks a comparability break: the centre line stops, steps, and resumes
offset. On a rule change with no break, the mark sits on an unbroken line.

Switching classification lens re-lanes the whole board — measured/judged/combat
gives different lanes than invasion/net-wall/target, and watching the marks
regroup is the point of having three lenses.

```
MOBILE — lanes rotate, time runs down

 ┌──────────────────────┐
 │ 1986 ─╫─ javelin     │
 │        redesign      │
 │        measured ■    │
 │                      │
 │ 1992 ─●─ back-pass   │
 │        invasion      │
 └──────────────────────┘
```

Sport pages sit on `surface` for the timeline and charts, and on a lightened
tint of the family colour for long reading sections, so the reading mode is
recognisable without a label.

## Charts

Record progressions as stepped lines in `chalk` on the family surface. Each
segment is a separate path. At a break the axis is interrupted with a visible
gap and the segments do not share a baseline — the eye must not be able to
complete the line.

Where a series cannot exist, the chart area holds a short written explanation set
in body type, framed in `unmarked`. It occupies the same space a chart would, so
absence has weight instead of being a hole.

## Motion

One moment: on first load the four lanes paint from left to right, roughly 1.2s,
the way a line marker walks a pitch. Marks appear as the paint passes them. Then
nothing moves on its own.

Interaction motion is welcome: lens switching animates the re-laning, since that
transition is the information. `prefers-reduced-motion` renders the painted board
immediately and switches lenses without tweening.

## What I changed and why

First pass reached for a warm cream ground with a red-oxide running-track accent
and a big condensed serif — which is both the current generated-design house
style and a cliché of sports branding. Kept the surface-derived logic but moved
to the dark painted ground, where white line-work actually behaves like line-work
and the four family colours can sit together without muddying.

Second pass had cause categories as additional colours. That put eleven hues on
one screen and destroyed the family reading. Moved cause to mark shape, which
also survives colour-blind viewing and greyscale printing.
