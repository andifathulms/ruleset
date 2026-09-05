# PRD — Ruleset

*How sports became the sports they are.*

Alternative names if this one doesn't stick: **Amendments**, **Sport Codex**,
**The Laws**.

---

## 1. Why this exists

Every sport is a set of rules that someone changed, for a reason, on a date.
Wikipedia will tell you that badminton switched to 21-point rally scoring in
2006. It will not tell you that the switch belongs to a wave of scoring rewrites
driven by broadcast scheduling that also caught table tennis and volleyball, or
that it severed every match statistic before it from every one after.

This site treats a rule change as a first-class object with a cause, a date, a
citation, and a measurable consequence. The consequence is often that a number
series stops being continuous — and that is the part nobody records systematically.

Read-only. Built for the author to read.

## 2. Structure

Three levels, using the IOC's own vocabulary so the taxonomy itself is citable:

**Sport** (badminton) → **discipline** (singles) → **event** (men's singles).

Two layers of depth, marked as such throughout:

**Skeleton layer — the whole Olympic program.** Every sport, discipline, and
event with its status per edition. This is structured data, not research: tug of
war held from 1900 to 1920, golf absent from 1904 to 2016, karate contested at
2020 only, breaking at 2024 only and dropped for 2028, cricket returning in 2028.
Cheap to build and interesting on its own.

**Deep layer — four sports in v1:** badminton, athletics, football, gymnastics.
One from each family, chosen because a "rule" is a structurally different object
in each:

| Family | What a rule governs | Series it affects |
|---|---|---|
| Racket | Scoring system, service | Match statistics |
| Measured | The implement and the record | World record progression |
| Invasion | Space and time | Rate statistics (goals per game) |
| Judged | The scoring scale itself | Nothing continuous — see §5 |

Building one of each first stops the data model overfitting to one shape.

## 3. The rule change object

The core object of the site.

```
rule_change
  sport / discipline / event scope
  date_effective, date_adopted
  governing_body
  what_changed        prose, one paragraph
  cause_primary       closed vocabulary
  cause_secondary     optional
  trigger             the specific incident, if there was one
  citation            rulebook edition + article, or minutes
  comparability_break reference to a series break, if any
```

### Cause vocabulary (closed)

`safety` · `broadcast and pacing` · `dominance suppression` ·
`equipment and technology` · `fairness and eligibility` · `commercial` ·
`participation and access` · `integrity` · `disputed`

Exactly one primary cause, cited. Where sources disagree on why a rule changed,
the cause is `disputed` and both readings are recorded. Never guess a motive
because it sounds plausible — governing bodies frequently state one reason and
are widely believed to have had another, and that gap is itself worth recording
in `trigger`.

### Trigger

The specific incident, where one exists. This is what makes the timeline read as
history rather than legislation: the 19–18 game behind basketball's shot clock,
the throw that pushed the javelin to the end of the stadium, the judging
controversy that ended the Perfect 10.

## 4. The cross-sport timeline (the spine)

All four sports on one horizontal time axis, one lane per family, rule changes as
marks on the lane, coloured by cause.

This is the whole argument for the site. Individually the rule changes are
trivia; laid out together the clustering is visible — broadcast-driven scoring
rewrites arriving in a wave through the 1990s and 2000s, safety changes following
deaths, suppression changes following a period of one nation winning everything.

Filterable by cause and by classification lens, which answers a real question:
do judged sports change their rules for different reasons than measured ones?

## 5. Comparability breaks

A rule change that severs a quantitative series, so that numbers on either side
of it cannot be compared.

The series differs by family, so the model is general: a **series** has
**segments**, and a break references the rule change that caused it. Nothing is
ever interpolated, smoothed, or trend-lined across a break.

Four worked cases for v1, deliberately contrasting:

- **Athletics** — the javelin was redesigned in 1986 and the record book reset.
  The break is total and the governing body acknowledged it.
- **Swimming** (reference case) — polyurethane suits were banned after 2009, but
  the records set in them were allowed to stand, which is why several remain
  unbeaten. Same problem as the javelin, opposite decision. Two governing bodies
  can face identical facts and rule differently; the site should show that.
- **Football** — goals per game shifts after the 1992 back-pass rule. No single
  citable series exists for "football" as a whole, so this must be scoped to one
  named competition and labelled as that competition, never as the sport.
- **Gymnastics** — the open-ended Code of Points from 2006 put scores on an
  incompatible scale. There is likely **no chartable series at all**. Where a
  chart would sit, the page states that the series cannot exist and why. This is
  the most extreme break in v1, not a missing feature.

## 6. Classification — three switchable lenses

1. **Official** — the IOC's sport / discipline / event grouping as published per
   Games.
2. **Game category** — invasion, net and wall, striking and fielding, target;
   cite the source of the taxonomy rather than inventing one.
3. **Adjudication** — measured, judged, combat, and decided by score.

Lenses recolour and regroup the same objects. They are not tags on a page; they
are ways of sorting the whole corpus, and the timeline honours the active lens.

## 7. Sport page sections

1. Identity, governing body, current status in the Olympic program
2. **Origin and invention** — including descent from other codes where it applies
3. **Rule timeline** — the sport's own lane, expanded
4. **Equipment evolution** — tied to the rule changes that forced it
5. **Governing body politics and schisms** — professionalism splits, breakaway
   federations, the disputes behind the rules
6. **Controversies that forced rule changes** — the incidents, linked to the
   rules they produced
7. Series charts, with breaks rendered as breaks

## 8. Sources

Primary sources are unusually good here, and this is the main advantage over the
history app: rulebooks are published, versioned, and public. Cite the edition and
article, not a summary of it.

IFAB Laws of the Game and their annual amendment circulars · World Athletics
technical rules and record progressions · BWF statutes and laws of badminton ·
FIG Code of Points, published per quadrennium · World Aquatics rules and record
progressions · Olympedia and official IOC program listings for the skeleton layer.

Where a rule change predates online archives, cite the printed edition. Where no
source can be found, the entry says so and is marked incomplete rather than
filled in from recollection.

## 9. Non-goals

- No editing, accounts, or contributions. Read-only, static.
- No estimated numbers and no interpolation across a break.
- No ranking of sports against each other.
- No results, fixtures, or live data. This is about rules, not competition.
- No completeness. Coverage grows where the author's curiosity goes, and the site
  says so plainly.
