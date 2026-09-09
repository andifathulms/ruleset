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

- **Skeleton** — three programmes under `content/programmes/`: the Olympic
  Games (47 sports, 31 editions), the Asian Games (45 sports) and the World
  Games (31 sports). Status per edition only, carrying no causes and no rule
  citations. Each programme names the editions whose rosters have actually
  been entered; every other column is hatched rather than blank, because
  "nobody checked" and "absent" are not the same claim and must not be drawn
  the same way.
- **Deep** — sixty-seven sports: badminton, athletics, football, gymnastics,
  swimming, table tennis, basketball, cycling, judo, archery, volleyball,
  tennis, weightlifting, modern pentathlon, cricket, baseball, taekwondo,
  boxing, equestrian, fencing, rowing, sailing, golf, sport climbing, wrestling,
  shooting, hockey, triathlon, squash, surfing, lacrosse, breaking, rugby,
  handball, canoeing, skateboarding, karate, softball, flag football, korfball,
  flying disc, powerlifting, tug of war, fistball, orienteering, sumo,
  floorball, lifesaving, kabaddi, sepak takraw, finswimming, racquetball and
  dancesport, ju-jitsu, muaythai, wushu, kickboxing, boules, bowling, dragon
  boat, soft tennis, air sports, roller sports, underwater sports,
  cheerleading, billiards and kurash.

  The first thirty-nine are every sport on the 2028 summer programme.
  Twenty-three are World Games sports — twenty-two that have never been
  Olympic, plus tug of war, which was removed in the 1920s and carried on
  without the Games for a century — and five, kabaddi, sepak takraw, dragon
  boat, soft tennis and kurash, are contested at the Asian Games and nowhere
  else. Twelve more sit in the skeleton.

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

## Where a sport is contested

The Olympic programme used to do two jobs here: it was the skeleton layer, and
it was the boundary of what counted as a sport. An event carried `olympic: true`
or `false` — and a boolean can only say "not on the programme", so compound
archery, high diving and canoe polo all read as the same kind of absence when
they are three different ones.

Events now carry `at`: a list over `olympic`, `paralympic`, `asian-games`,
`world-games`, `world-championship`, `professional`, `federation-only` and
`lapsed`. The list has no default, and the build refuses an event without one —
an unchecked event used to be indistinguishable from one checked and found
non-Olympic. Rows that are not competitions at all (a governing body, modern
pentathlon's five components, weightlifting's two lifts) carry `context: true`
and are not given a status they cannot have.

The point of the change is that the Olympic boundary is itself a rule change
with a cause and a date, which is the object this site was built to hold.
Compound archery has been proposed and turned down repeatedly. Karate was
admitted by one host city and dropped by the next. Squash spent decades at the
World Games while the Games declined it. Some of those were already full rule
entries and the rest were parentheticals; now they are the same kind of thing.

The fourth lens, **Standing**, is the payoff, and it is the only lens derived
from this site's own data rather than a published taxonomy. It groups sports by
how they hold their place, and it produced the most surprising number here:
**eighteen of the thirty-seven sports on the 2028 programme have been removed
from it and brought back at least once**, accounting for 96 of the 201 rule
changes. Its two non-Olympic lanes were empty when the lens was built, because
every sport researched here was an Olympic one — an honest fact about the
coverage rather than a defect in the lens. Adding korfball, flying disc,
powerlifting and tug of war filled them, which is what those four were for.

The World Games sports were then chosen the way the Olympic ones were — for
what each proves rather than for coverage:

- **Fistball and floorball** are controlled experiments in what one rule does
  to a sport. Fistball is volleyball with the ball allowed to bounce, and that
  single permission moves its entry barrier down a full step without lowering
  its ceiling. Floorball never wrote an offside rule, reaching by omission the
  continuous shape hockey had to abolish its own rule in 1998 to get.
- **Orienteering** is the site's sharpest comparability case. It is timed to
  the second and can never have a record, because the terrain is embargoed and
  the rules set a course to a *target winning time* — so the finishing time is
  an input to the course design, not a measurement of the athlete. The exact
  inverse of athletics.
- **Sumo** is the only combat sport here with no weight classes, and the only
  sport whose world championship structurally cannot contain its best
  competitors: the professional Japanese association governs them and enters
  nothing.
- **Lifesaving** has rules that answer to a body of knowledge outside sport.
  Competition technique must reflect current rescue practice, so when
  resuscitation guidance changes the sport changes, and a method that was fast
  and correct becomes a disqualification.

And the fifth wave, which pushed past the World Games into the Asian ones:

- **Kabaddi** is the only sport here whose central rule regulates breathing.
  The raider chants continuously and the raid ends when the chant does — judged
  by ear, over a crowd. Its 2014 raid clock was written for a domestic
  television league and adopted internationally afterwards, which is the
  clearest case on this site of a broadcaster writing a sport's laws.
- **Sepak takraw** is volleyball with two rules changed: no hands, and one
  player may take all three touches. The first raises the technical floor
  enormously, the second raises the ceiling. Its name is a compromise between
  the Malay and Thai words, adopted so neither country's term won.
- **Finswimming** is the third answer to the equipment-and-records question.
  Swimming banned the supersuits and kept the records; athletics redesigned the
  javelin and reset the book; finswimming can do neither, because an athlete
  without a fin is not in the sport — so it caps the blade by dimension and
  splits the book by fin type.
- **Racquetball and squash** are the site's cleanest natural experiment.
  Racquetball deleted its boundaries and is trivially easy to start; squash kept
  them. Squash rewrote its scoring for broadcast and is on the 2028 Olympic
  programme; racquetball kept side-out scoring and is at the World Games.
- **DanceSport** held IOC recognition for nearly thirty years without a place,
  then converted it into one — for breaking, in 2024, which it had governed for
  three years and which was dropped for 2028. Its own disciplines have never
  been on a programme.

The sixth wave took the combat lane, which turned out to be about where a
sport's summit actually sits:

- **Ju-jitsu** legislates range. A Fighting bout passes through striking, then
  throwing, then groundwork, so nobody can avoid the phase they are weakest in
  — and its Duo system contests two athletes from the *same team* performing
  defences against called attacks, judged, with no opponent at all.
- **Muaythai** has the widest striking permission here — fists, elbows, knees,
  shins, and a clinch that is fought in — and the same structure as sumo: the
  recognised amateur code is padded and restricts elbows, while the sport's
  summit is a Thai professional system scored by weighting the later rounds,
  which the federation does not govern.
- **Wushu** is the only sport here designed by a government. Its judged taolu
  took declared-difficulty scoring in 2003 and severed its own history exactly
  as gymnastics did in 2006; its sanda is fought on a platform whose edge
  scores. In 2008 a wushu tournament was held inside the Beijing Games without
  being an Olympic event.
- **Kickboxing** requires a minimum number of kicks per round, because a
  fighter left to optimise freely stops throwing them and the sport turns back
  into boxing. It is the only technique quota on this site, and the clearest
  case of a rule written to stop a sport becoming a different one.

The seventh wave took the sports with large participation and almost no
institutional weight, and found five different reasons for that:

- **Boules** is the only sport here founded on an accessibility accommodation.
  Pétanque was created at La Ciotat in 1907 by removing the run-up so a player
  with rheumatism could keep competing, and the removal made a better game. It
  is also a target sport whose target moves, and whose competitors measure the
  result themselves with callipers.
- **Bowling** is the strangest comparability case on the site, because nothing
  about its scoring ever changed. A strike has scored ten plus the next two
  deliveries for a century and the maximum is still 300 — which is exactly why
  the numbers cannot be compared, since reactive resin balls in the early 1990s
  made reaching them far easier while the scale stood still. Its answer was one
  nothing else here has had: leave the equipment alone and change the invisible
  oil pattern the equipment acts on.
- **Dragon boat** carries twenty-two people of whom two supply no propulsion —
  a drummer beating time and a steerer — and its breast cancer survivor
  divisions are the only competitive category here created by a clinical trial.
- **Soft tennis** exists because Meiji-era Japan could not affordably import
  tennis balls. Substituting a 30-gram rubber one around 1884 produced a
  different sport, and it is the controlled version of the argument the tennis
  and badminton pages make: change only the implement and the learning curve
  inverts.
- **Air sports** has the highest entry barrier here, set by aviation law rather
  than by anything sporting — and a federation founded in 1905 to certify
  records rather than run contests, which is how a sporting body came to fix
  the accepted boundary of space at 100 km.

The eighth wave took what was left with genuinely distinct laws:

- **Roller sports** is the sharpest institutional story here. Every discipline
  is the wheeled twin of a Winter Olympic sport — artistic roller skating is
  figure skating on wheels, judged the same way — and none has ever been on a
  programme, because a selection committee can always say the Games already
  contests that sport. Then the federation merged with skateboarding in 2017,
  and the one discipline with no ice twin was Olympic within four years.
- **Underwater sports** contains the only team sport played in a volume rather
  than on a surface: underwater rugby, in a five-metre pool, with a ball filled
  with saltwater so it sinks. Underwater hockey has no goalkeeper, because
  nobody can hold their breath in one place long enough to be one.
- **Cheerleading** is the only sport here invented to be an audience — organised
  crowd-leading from 1898, by men, flipping to overwhelmingly female during the
  Second World War. Its scoring ceiling is set by a safety code rather than by
  what athletes can do, which makes its scoresheet partly a medical document.
- **Billiards** is three codes on three incompatible tables, one with no pockets
  at all. Snooker's miss rule is one of very few here that adjudicates intent,
  and its maximum break of 147 is a bounded perfect score that equipment has
  not devalued — the direct contrast with bowling's 300.
- **Kurash** completes a line the site can now draw through three sports:
  ju-jitsu legislates that a bout pass through every range; judo has spent
  fifteen years narrowing towards one, banning leg grabs in 2013; and kurash
  starts there, standing only, with no groundwork and no grip below the waist.

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
  programmes/
    olympic.yaml         skeleton layer — status per edition
    asian-games.yaml
    world-games.yaml
  lenses.yaml            four classification schemes
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
