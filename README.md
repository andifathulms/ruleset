# Ruleset

*How sports became the sports they are.*

A read-only, fully static site that treats a rule change as a first-class object
with a cause, a date, a citation, and a measurable consequence. The consequence
is often that a number series stops being continuous — and that is the part
nobody records systematically.

Read [PRD.md](PRD.md) and [DESIGN.md](DESIGN.md) first; [CLAUDE.md](CLAUDE.md)
holds the build rules.

## Running it

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to out/
```

Next.js 14 with `output: 'export'`. No backend, no database, no API routes, no
runtime fetching. Pushing to `main` builds and publishes to GitHub Pages; the
workflow works out `BASE_PATH` from the repository name.

## What is here

Three layers, marked as such everywhere:

- **Skeleton** — 47 sports across 31 editions in `content/program.yaml`. Status
  per edition only, sourced to Olympedia, carrying no causes and no rule
  citations.
- **Deep** — thirty-nine sports: badminton, athletics, football, gymnastics,
  swimming, table tennis, basketball, cycling, judo, archery, volleyball,
  tennis, weightlifting, modern pentathlon, cricket, baseball, taekwondo,
  boxing, equestrian, fencing, rowing, sailing, golf, sport climbing, wrestling,
  shooting, hockey, triathlon, squash, surfing, lacrosse, breaking, rugby,
  handball, canoeing, skateboarding, karate, softball and flag football.

  That is every sport on the 2028 summer programme. The eight that remain in the
  skeleton — tug of war, polo, rackets, roque, croquet, jeu de paume, basque
  pelota and motorboating — lapsed from the programme before 1940 and carry
  status and classification only.

The first five were one per family, because a "rule" is a structurally
different object in each: racket sports legislate scoring, measured sports
legislate the implement, invasion sports legislate space and time, and judged
sports legislate the scoring scale itself. The second seven were chosen to make
comparisons possible rather than to add coverage:

- **Table tennis and volleyball** complete the broadcast scoring wave the
  homepage argument rests on. Volleyball rewrote its scoring in 1999, table
  tennis in 2001, badminton in 2006 — one stated reason between them, and not
  one kept a series across its own change.
- **Tennis** is the racket sport that declined to. Set against badminton it
  shows that a sport's accessibility is a property of its implement: a shuttle
  decelerates and a tennis ball does not, and two otherwise identical games end
  up with opposite learning curves.
- **Cycling** is the only sport to have answered the equipment-and-records
  question three ways — leave it, split it, merge it.
- **Basketball** supplies the 19–18 game the PRD names as its model trigger.
- **Judo and archery** fill the Combat and Target lanes, without which two of
  the three lenses were visibly incomplete.

And the third wave, again chosen for what each proves:

- **Weightlifting** has annulled its entire world record book twice, in 1993
  and 2018, by redrawing its bodyweight categories — the only sport to reach
  for the same instrument a second time, which is the best evidence available
  that annulling a record book does not change what produced it.
- **Modern pentathlon** deleted a founding discipline nine months after a
  televised incident. The most drastic trigger-to-rule sequence here, and the
  only rule change publicly contested by the athletes it applies to.
- **Cricket and baseball** fill the last empty lane. Cricket is the only
  *voluntary* comparability break on the site — three formats, three record
  books, never merged, deliberately. Baseball ran two different batting rules
  in one competition for forty-nine years.
- **Taekwondo** is the only sport to change adjudication category. Sensors in
  2009 turned a judged sport into a measured one.
- **Boxing** tried the same fix in 1992 with buttons in the judges' hands
  instead of sensors on the athlete, reversed it in 2016, and lost its
  governing body in 2023.

The fourth wave was picked for the same reason:

- **Rowing, sailing and golf** are three answers to one question — our
  conditions cannot be standardised, so what do our numbers mean? Rowing
  refuses to call its times records. Sailing abandoned times entirely and
  scores a series of positions with a discard. Golf built the handicap, the
  only deliberate comparability *solution* anywhere in this collection.
- **Fencing** did taekwondo's judged-to-measured crossing fifty years earlier
  and took fifty-two years to finish, one weapon at a time.
- **Equestrian** is the only sport with a non-human competitor and the only
  fully mixed-gender one, now facing the welfare pressure that removed riding
  from modern pentathlon.
- **Sport climbing** holds the best and worst comparability on the site at
  once: a speed route identical worldwide since 2007, and an Olympic combined
  format that multiplied ranks together and lasted one Games.
- **Wrestling** is the only sport here to have rewritten its rules to survive.
  Voted off the programme in February 2013, reinstated in September.
- **Shooting** measures more precisely than anything here and has spent thirty
  years arranging its competition so the measurement matters less.

The fifth wave completed the 2028 summer programme, and the sports left over at
that point turned out to share a theme — every one of them is arguing about
whether it belongs:

- **Hockey, triathlon and squash** are the sports that changed their format for
  television and for the Games. Hockey abolished the offside rule outright in
  1998, which no other invasion sport has done. Squash spent thirty years
  failing to be selected and rewrote its scoring in the attempt.
- **Surfing, breaking and skateboarding** are judged sports admitted from
  outside the federation system, each having had to invent an objective scoring
  apparatus for an activity that never wanted one. Breaking lasted a single
  Games.
- **Rugby sevens and handball** legislate contact in a period when the medical
  evidence about contact keeps moving.
- **Canoeing** is two disciplines that share a boat and nothing else, and
  **karate** is the clearest case on the site of a sport admitted by one host
  city and dropped by the next.
- **Softball and flag football** are both defined by another sport. Softball
  shares an Olympic listing with baseball and was removed after 2008 for
  reasons that were largely baseball's. Flag football is American football with
  the tackle taken out — the only sport here whose founding rule is a
  subtraction.

- **Current law** — `play.yaml` per deep sport: what the rules actually say now,
  written against nine canonical sections in a fixed order, so the same clause
  can be read across sports. `/play` asks one of those questions of every sport
  at once.
- **Editorial** — `learning.yaml`: how hard a sport is to start and how hard to
  be good at. This is the only layer that is not sourced, and it is labelled
  editorial everywhere it appears.

The current-law layer is deliberately not a neutral encyclopedia entry. Each
clause lists the recorded rule changes that produced it and links to them, so
badminton's serve section carries 2018 and its scoring section carries 2006. The
current law is the accumulated output of the timeline, and says so.

## The five rules this codebase enforces

1. **Never draw a line across a break.** Enforced in `lib/series.ts`, not by
   convention. It never returns a single point list for a broken series and
   never returns a shared scale for two segments, so no chart component can draw
   across a break even by mistake. `assertSegmentsAreClean` fails the build if a
   point is filed on the wrong side of one.
2. **Never invent a citation.** `content/sources.yaml` carries a `standing`
   field — checked, named, secondary, absent — and the site renders it. An entry
   whose article has not been confirmed against the text shows as incomplete.
3. **Never infer a cause.** `cause_primary` comes from a closed vocabulary of
   nine and from a stated reason or a sourced account. Where sources disagree
   the cause is `disputed` and both readings are kept.
4. **Never present a scoped series as the sport's.** `chartTitle` is the only
   supported way to name a series and it refuses to omit the competition.
5. **Where a series cannot exist, say so in place of the chart.** The prose
   occupies the space the chart would, framed in `unmarked`, styled as content
   and not as an error.

And rule 6: the skeleton layer never borrows the deep layer's authority.
Uncovered sports show status and classification only and are marked as such.

## Layout

```
/content
  program.yaml           skeleton layer — status per edition
  lenses.yaml            three classification schemes
  causes.yaml            closed cause vocabulary
  sources.yaml           every source, with its standing
  /sports/<sport>
    sport.yaml           identity, governing body, classification
    rules.yaml           every rule change
    play.yaml            the laws in force, in nine canonical sections
    learning.yaml        barrier to entry and barrier to the top, editorial
    events.yaml          the discipline and event tree
    series/*.yaml        a series with its segments and its break
    0*.mdx               origin, equipment, politics, controversies,
                         officiating, geography, contested
/lib
  types.ts               the data model
  content.ts             build-time loaders
  timeline.ts            lanes, marks, and the break-in-the-lane geometry
  series.ts              segment handling — the hard rules live here
/components
  CurrentLaws.tsx        the laws in force, linked back to what produced them
  LearningCurve.tsx      two verdicts, with what each rests on
  LearningBoard.tsx      both verdicts for every sport, ordered by the gap
  EventTree.tsx          sport to discipline to event
  LawCompare.tsx         one clause read across every sport
  Timeline.tsx           the spine
  SeriesChart.tsx        segments that cannot be joined
  RuleList.tsx           a rule change in full
  Mark.tsx               nine causes as nine shapes
  MiniLane.tsx           one sport's lane at card size
  BreakDiagram.tsx       the argument, drawn: a line that stops and steps
  Motion.tsx             scroll reveal, counters, read progress
  SiteHeader.tsx         sticky nav that condenses on scroll
  SectionNav.tsx         where in a sport page you are
```

## The editorial layer

`learning.yaml` is the one part of this site that is not sourced, and it exists
because "is badminton easy?" is a real question that no amount of citation
answers. It is handled as follows, and the handling is the point:

- Two verdicts on a **five-point ordinal**, never a score out of ten. Nothing is
  ever summed, averaged or ranked, because "twice as hard" is not measurable.
  `LearningBoard` deliberately shows two aligned scales rather than a scatter,
  since a scatter puts ordinals at coordinates and invites the eye to measure
  distances that do not exist.
- Every piece of evidence declares its **basis**: `rule` (a sourced rule change
  on this site, which it links to), `observation` (a checkable fact), or
  `judgement` (an estimate, shown in `unmarked` and tagged *estimate*).
- The loader **fails the build** if an item claims a rule basis without naming a
  rule, or names a rule the sport does not have.
- The word *editorial* appears at the top of the section, under each verdict,
  and on every unsourced row.

## Design

White line-work on painted surfaces. The lane is the primary structure, the mark
on the lane is the rule change, and a comparability break is drawn as a break in
the line itself — the lane stops, offsets vertically, and restarts. Nothing else
on the page is allowed to break a line.

Colour carries sport family; **cause is carried by mark shape**, so the board
survives greyscale and colour-blind viewing with the family reading intact.
DESIGN.md and CLAUDE.md disagree on this point — DESIGN.md's second pass moved
cause from colour to shape and gives its reasoning, so that is what is
implemented.

The ground is a two-step ink: a near-black page with the court teal reserved
for anything raised off it, lit by a soft wash from the top corners and carrying
a fine grain so the large flat areas do not band. Each family colour has a
brighter sibling for line-work, labels and glow — the base hues were mixed as a
fill and lost their edge as a stroke.

Archivo at 62% width for headings and all numerals, narrower and tighter still
at signage sizes; IBM Plex Sans for body, on a fluid scale with the measure
capped at 70 characters. Long reading sections sit on a tint of the sport's
family colour, so reading mode is recognisable without a label.

Motion answers the reader rather than running on its own. The lanes paint left
to right the way a line marker walks a pitch and the marks scale in as the paint
reaches them; a record draws itself when you arrive at it; sections rise as they
enter view; switching lens slides the indicator and re-lanes the board. Nothing
loops. `prefers-reduced-motion` renders everything immediately and printing
forces every deferred reveal visible, so a print is never a blank column.

## Where it is incomplete, deliberately

Coverage grows where the author's curiosity goes, and the site says so rather
than implying completeness.

Two series carry no figures. Football's goals per game and badminton's match
statistics could both exist as scoped series; neither has been assembled from a
cited source, so both state that in place of a chart. Gymnastics is the
different case — there, no series can exist at all, and the distinction between
"impossible" and "merely unpublished" is recorded in the data as
`absence_kind`.

The law summaries carry the same standing as the citations and the same warning
in the interface: the figures were entered from the named edition but have not
been checked against its text line by line. They are this site's reading of the
laws, not a substitute for them, and every one links to the rulebook itself.

Most citations name the right edition without a confirmed article number. Every
one of those renders as incomplete, and `/sources` counts them. Promoting a
citation to `primary-checked` means opening the document — one sport at a time,
one rulebook at a time. Nothing is promoted from recollection.
