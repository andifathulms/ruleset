'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { scaleLinear } from 'd3'
import {
  applyFilters, buildLanes, buildMarks, laneLinePieces, markOffset, timeDomain,
  type Lane, type TimelineMark,
} from '@/lib/timeline'
import { BREAK_KIND_LABEL } from '@/lib/series'
import type { Cause, CauseId, Lens, RuleChange, Series, Source, Sport } from '@/lib/types'
import { Mark, MarkGlyph } from './Mark'

/** Base is the fill; bright is the line-work, the label, and the glow. */
const SURFACE: Record<string, string> = {
  pool: '#1D6FA8',
  pitch: '#2F7D4F',
  clay: '#B7502A',
  gold: '#C8A02C',
  unmarked: '#7A8C8A',
}

const BRIGHT: Record<string, string> = {
  pool: '#57ACE8',
  pitch: '#5CC684',
  clay: '#EA7E4E',
  gold: '#F2C94F',
  unmarked: '#9FB2B0',
}

const CHALK = '#F2F5F1'
const UNMARKED = '#7A8C8A'

export interface TimelineProps {
  rules: RuleChange[]
  series: { sport: string; series: Series }[]
  lenses: Lens[]
  causes: Cause[]
  sports: Sport[]
  sources: Source[]
}

const LANE_H = 116
const DENSITY_H = 58
const PAD = { top: 54, right: 26, bottom: 30, left: 148 }

export default function Timeline(props: TimelineProps) {
  const { rules, series, lenses, causes, sports } = props

  const [lensId, setLensId] = useState(lenses[0]?.id ?? 'official')
  const [activeCauses, setActiveCauses] = useState<CauseId[]>([])
  const [range, setRange] = useState<[number, number] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [width, setWidth] = useState(1040)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const causeMap = useMemo(
    () => Object.fromEntries(causes.map((c) => [c.id, c])) as Record<CauseId, Cause>,
    [causes],
  )
  const ruleMap = useMemo(() => Object.fromEntries(rules.map((r) => [r.id, r])), [rules])
  const sportMap = useMemo(() => Object.fromEntries(sports.map((s) => [s.id, s])), [sports])
  const withdrawn = useMemo(
    () => new Set(rules.filter((r) => r.status && r.status !== 'adopted').map((r) => r.id)),
    [rules],
  )

  const allMarks = useMemo(() => buildMarks(rules, series), [rules, series])
  const fullDomain = useMemo(() => timeDomain(allMarks), [allMarks])
  const bounds: [number, number] = range ?? [
    Math.floor(fullDomain[0]),
    Math.ceil(fullDomain[1]),
  ]

  const lens = lenses.find((l) => l.id === lensId) ?? lenses[0]

  const marks = useMemo(
    () => applyFilters(allMarks, { causes: activeCauses, from: bounds[0], to: bounds[1] }),
    [allMarks, activeCauses, bounds],
  )

  // Switching lens rebuilds the lanes, rather than recolouring marks in place.
  const lanes = useMemo(() => buildLanes(lens, marks, series), [lens, marks, series])

  const vertical = width > 0 && width < 760
  const selectedRule = selected ? ruleMap[selected] : null
  const filtered = activeCauses.length > 0 || range !== null

  const toggleCause = (id: CauseId) =>
    setActiveCauses((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))

  return (
    <div ref={wrap} className="w-full">
      <Controls
        lenses={lenses}
        lensId={lensId}
        onLens={setLensId}
        causes={causes}
        active={activeCauses}
        counts={useMemo(() => tally(allMarks), [allMarks])}
        onToggleCause={toggleCause}
        bounds={bounds}
        fullDomain={[Math.floor(fullDomain[0]), Math.ceil(fullDomain[1])]}
        onRange={setRange}
        blurb={lens.blurb}
        showing={marks.length}
        total={allMarks.length}
        filtered={filtered}
        onReset={() => {
          setActiveCauses([])
          setRange(null)
        }}
      />

      <div className="mt-5 overflow-hidden border chalk-rule bg-surface/50">
        {vertical ? (
          <VerticalBoard
            lanes={lanes}
            bounds={bounds}
            causeMap={causeMap}
            withdrawn={withdrawn}
            selected={selected}
            onSelect={setSelected}
          />
        ) : (
          <HorizontalBoard
            key={lensId}
            lanes={lanes}
            bounds={bounds}
            width={width}
            causeMap={causeMap}
            withdrawn={withdrawn}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </div>

      <Detail
        rule={selectedRule}
        sport={selectedRule ? sportMap[selectedRule.scope.sport] : undefined}
        cause={selectedRule ? causeMap[selectedRule.cause_primary] : undefined}
        breakInfo={
          selectedRule
            ? series.find((s) => s.series.break?.caused_by === selectedRule.id)?.series
            : undefined
        }
        sources={props.sources}
        onClose={() => setSelected(null)}
      />

      {marks.length === 0 && (
        <p className="mt-6 border-l-2 border-unmarked pl-4 text-[15px] text-unmarked">
          No rule changes match these filters. That is a fact about the filters,
          not about the sports.
        </p>
      )}
    </div>
  )
}

function tally(marks: TimelineMark[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const m of marks) out[m.cause] = (out[m.cause] ?? 0) + 1
  return out
}

/* ------------------------------------------------------------------ controls */

function Controls({
  lenses, lensId, onLens, causes, active, counts, onToggleCause, bounds, fullDomain, onRange,
  blurb, showing, total, filtered, onReset,
}: {
  lenses: Lens[]
  lensId: string
  onLens: (id: string) => void
  causes: Cause[]
  active: CauseId[]
  counts: Record<string, number>
  onToggleCause: (id: CauseId) => void
  bounds: [number, number]
  fullDomain: [number, number]
  onRange: (r: [number, number] | null) => void
  blurb: string
  showing: number
  total: number
  filtered: boolean
  onReset: () => void
}) {
  const index = Math.max(0, lenses.findIndex((l) => l.id === lensId))
  const span = fullDomain[1] - fullDomain[0]
  const pct = (y: number) => ((y - fullDomain[0]) / span) * 100

  return (
    <div className="flex flex-col gap-6 border chalk-rule bg-surface/40 p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-10">
        <fieldset>
          <legend className="eyebrow mb-2.5">Classification lens</legend>
          {/* A segmented control: the indicator slides, so switching lens reads
              as one board being re-laned rather than three separate boards. */}
          <div
            className="relative grid border border-chalk/20 p-1"
            style={{ gridTemplateColumns: `repeat(${lenses.length}, minmax(0, 1fr))` }}
          >
            <span
              aria-hidden
              className="absolute bottom-1 top-1 bg-chalk transition-transform duration-500 ease-swing"
              style={{
                width: `calc((100% - 0.5rem) / ${lenses.length})`,
                transform: `translateX(${index * 100}%)`,
                left: '0.25rem',
              }}
            />
            {lenses.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLens(l.id)}
                aria-pressed={l.id === lensId}
                className={`relative z-10 whitespace-nowrap px-4 py-1.5 font-display text-[16px] tracking-wide transition-colors duration-300 ${
                  l.id === lensId ? 'text-ink' : 'text-chalk/70 hover:text-chalk'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-2.5 max-w-[42ch] text-[13px] leading-snug text-unmarked">{blurb}</p>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="eyebrow mb-2.5">Date range</legend>
          {/* Two native range inputs sharing one painted track. Native, so the
              keyboard and the screen reader get the control they expect. */}
          <div className="relative h-9 max-w-xl select-none">
            <span aria-hidden className="absolute inset-x-0 top-4 h-px bg-chalk/20" />
            <span
              aria-hidden
              className="absolute top-[13px] h-[3px] bg-chalk/70 transition-all duration-200"
              style={{ left: `${pct(bounds[0])}%`, right: `${100 - pct(bounds[1])}%` }}
            />
            <input
              type="range"
              aria-label="Earliest year"
              min={fullDomain[0]}
              max={fullDomain[1]}
              value={bounds[0]}
              onChange={(e) => onRange([Math.min(Number(e.target.value), bounds[1] - 1), bounds[1]])}
              className="range-thumb absolute inset-x-0 top-2 h-5 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              aria-label="Latest year"
              min={fullDomain[0]}
              max={fullDomain[1]}
              value={bounds[1]}
              onChange={(e) => onRange([bounds[0], Math.max(Number(e.target.value), bounds[0] + 1)])}
              className="range-thumb absolute inset-x-0 top-2 h-5 w-full appearance-none bg-transparent"
            />
          </div>
          <p className="mt-1 flex items-baseline gap-3 text-[13px] text-unmarked">
            <span className="numeral text-[19px] text-chalk">{bounds[0]}</span>
            <span aria-hidden className="h-px w-5 bg-chalk/30" />
            <span className="numeral text-[19px] text-chalk">{bounds[1]}</span>
            <span className="ml-auto">
              <span className="numeral text-chalk">{showing}</span> of{' '}
              <span className="numeral">{total}</span> on the board
            </span>
          </p>
        </fieldset>
      </div>

      <fieldset>
        <legend className="eyebrow mb-2.5">
          Cause — carried by shape, never by colour
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          {causes.map((c) => {
            const on = active.includes(c.id)
            const n = counts[c.id] ?? 0
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggleCause(c.id)}
                aria-pressed={on}
                title={c.definition}
                className={`flex items-center gap-2 border px-2.5 py-1.5 text-[13.5px] transition-all duration-300 ${
                  on
                    ? 'border-chalk bg-chalk text-ink'
                    : active.length
                      ? 'border-chalk/15 text-chalk/45 hover:border-chalk/40 hover:text-chalk'
                      : 'border-chalk/20 text-chalk/85 hover:border-chalk/50 hover:text-chalk'
                }`}
              >
                <span className={on ? 'text-ink' : 'text-current'}>
                  <MarkGlyph shape={c.mark} label="" />
                </span>
                {c.label}
                <span className={`numeral text-[12px] ${on ? 'text-ink/60' : 'text-unmarked'}`}>
                  {n}
                </span>
              </button>
            )
          })}
          {filtered && (
            <button
              type="button"
              onClick={onReset}
              className="ml-1 border border-dashed border-unmarked px-2.5 py-1.5 text-[13px] text-unmarked transition-colors hover:border-chalk hover:text-chalk"
            >
              Reset all
            </button>
          )}
        </div>
      </fieldset>
    </div>
  )
}

/* ---------------------------------------------------------------- horizontal */

interface Hover {
  x: number
  y: number
  mark: TimelineMark
  lane: Lane
}

function HorizontalBoard({
  lanes, bounds, width, causeMap, withdrawn, selected, onSelect,
}: {
  lanes: Lane[]
  bounds: [number, number]
  width: number
  causeMap: Record<CauseId, Cause>
  withdrawn: Set<string>
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const [hover, setHover] = useState<Hover | null>(null)
  const w = Math.max(width, 760)
  const laneTop = PAD.top
  const laneBottom = laneTop + lanes.length * LANE_H
  const h = laneBottom + DENSITY_H + PAD.bottom
  const x = scaleLinear().domain(bounds).range([PAD.left, w - PAD.right])

  const ticks = x.ticks(Math.max(4, Math.floor((w - PAD.left) / 120)))
  // Decade bands give the axis a rhythm to read against without adding a hue.
  const decades = useMemo(() => {
    const out: number[] = []
    for (let y = Math.ceil(bounds[0] / 10) * 10; y < bounds[1]; y += 20) out.push(y)
    return out
  }, [bounds])

  const allMarks = useMemo(() => lanes.flatMap((l) => l.marks), [lanes])

  return (
    <div className="relative overflow-x-auto">
      <div className="relative" style={{ width: w, height: h }}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={`Rule changes on ${lanes.length} lanes between ${bounds[0]} and ${bounds[1]}. Each lane is a group of sports; each mark is a rule change; a step in a lane is a comparability break.`}
          className="block"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            {Object.keys(SURFACE).map((k) => (
              <linearGradient key={k} id={`lane-${k}`} x1="0" x2="1">
                <stop offset="0" stopColor={SURFACE[k]} stopOpacity="0.22" />
                <stop offset="1" stopColor={SURFACE[k]} stopOpacity="0.04" />
              </linearGradient>
            ))}
            <linearGradient id="lane-empty" x1="0" x2="1">
              <stop offset="0" stopColor={UNMARKED} stopOpacity="0.08" />
              <stop offset="1" stopColor={UNMARKED} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Alternating twenty-year bands, so the eye has something to
              measure against without a second hue entering the board. */}
          {decades.map((d) => (
            <rect
              key={d}
              x={Math.max(PAD.left, x(d))}
              y={laneTop - 8}
              width={Math.max(0, Math.min(x(d + 10), w - PAD.right) - Math.max(PAD.left, x(d)))}
              height={laneBottom - laneTop + 16}
              fill={CHALK}
              fillOpacity={0.018}
            />
          ))}

          {/* Year axis, set large — years are display type. */}
          <g>
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={x(t)} x2={x(t)} y1={laneTop - 10} y2={laneBottom + 6}
                  stroke={CHALK} strokeOpacity={0.07}
                />
                <text
                  x={x(t)} y={laneTop - 22}
                  className="numeral"
                  fontSize={21} fill={CHALK} fillOpacity={0.5} textAnchor="middle"
                >
                  {t}
                </text>
              </g>
            ))}
          </g>

          {lanes.map((lane, i) => (
            <LaneRow
              key={lane.id}
              lane={lane}
              y={laneTop + i * LANE_H + LANE_H / 2}
              x={x}
              bounds={bounds}
              left={PAD.left}
              right={w - PAD.right}
              index={i}
              causeMap={causeMap}
              withdrawn={withdrawn}
              selected={selected}
              onSelect={onSelect}
              onHover={setHover}
            />
          ))}

          <DensityStrip
            marks={allMarks}
            x={x}
            bounds={bounds}
            left={PAD.left}
            right={w - PAD.right}
            top={laneBottom + 14}
            height={DENSITY_H - 20}
          />
        </svg>

        {hover && <Tooltip hover={hover} causeMap={causeMap} boardWidth={w} />}
      </div>
    </div>
  )
}

/** A rule change under the cursor, named without opening it. */
function Tooltip({
  hover, causeMap, boardWidth,
}: {
  hover: Hover
  causeMap: Record<CauseId, Cause>
  boardWidth: number
}) {
  const cause = causeMap[hover.mark.cause]
  const flip = hover.x > boardWidth - 300
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-20 w-[19rem] max-w-[80vw] border border-chalk/25 bg-ink/95 p-3.5 shadow-2xl backdrop-blur"
      style={{
        left: flip ? undefined : hover.x + 16,
        right: flip ? boardWidth - hover.x + 16 : undefined,
        top: hover.y - 12,
      }}
    >
      <p className="flex items-center gap-2 text-[13px] text-unmarked">
        <span className="numeral text-[20px] text-chalk">{hover.mark.year}</span>
        <span className="h-px w-3 bg-chalk/30" />
        {hover.lane.label}
      </p>
      <p className="mt-1.5 text-[14px] leading-snug text-chalk/90">{hover.mark.label}</p>
      <p className="mt-2.5 flex items-center gap-2 text-[13px] text-chalk/70">
        {cause && (
          <span className="text-chalk">
            <MarkGlyph shape={cause.mark} label="" />
          </span>
        )}
        {cause?.label ?? hover.mark.cause}
      </p>
      {hover.mark.breaksSeries && (
        <p className="mt-2 border-t border-chalk/15 pt-2 text-[12.5px] text-gold-bright">
          Severed a series — {BREAK_KIND_LABEL[hover.mark.breaksSeries.kind] ?? ''}
        </p>
      )}
    </div>
  )
}

function LaneRow({
  lane, y, x, bounds, left, right, index, causeMap, withdrawn, selected, onSelect, onHover,
}: {
  lane: Lane
  y: number
  x: (n: number) => number
  bounds: [number, number]
  left: number
  right: number
  index: number
  causeMap: Record<CauseId, Cause>
  withdrawn: Set<string>
  selected: string | null
  onSelect: (id: string | null) => void
  onHover: (h: Hover | null) => void
}) {
  const colour = SURFACE[lane.colour] ?? UNMARKED
  const bright = BRIGHT[lane.colour] ?? UNMARKED
  const { pieces, steps } = laneLinePieces(lane, x, bounds)
  const length = right - left

  /* Year labels alternated on index parity, which put two adjacent marks on
     the same side whenever a third sat between them. Sides are now chosen by
     how close the last label on each side actually is. */
  const labelSide = useMemo(() => {
    let lastAbove = -Infinity
    let lastBelow = -Infinity
    return lane.marks.map((m) => {
      const px = x(m.time)
      // Whichever side has more room. Preferring one side and only falling
      // back on the other still collided once three marks arrived together.
      const above = px - lastAbove >= px - lastBelow
      if (above) lastAbove = px
      else lastBelow = px
      return above
    })
  }, [lane.marks, x])
  const top = y - LANE_H / 2 + 9
  const boxH = LANE_H - 18

  return (
    <g>
      {/* The lane is painted in the family colour, fading along its run so the
          board does not read as five solid slabs — a flat 26% fill across the
          whole width buried the chalk line-work it exists to carry. An
          uncovered lane is painted in `unmarked` and stays visible: an empty
          lane is a fact about the coverage, not noise. */}
      <rect
        x={left} y={top} width={Math.max(0, right - left)} height={boxH}
        fill={`url(#lane-${lane.empty ? 'empty' : lane.colour})`}
      />
      <line x1={left} x2={right} y1={top} y2={top} stroke={CHALK} strokeOpacity={0.06} />
      <rect
        x={left} y={top} width={4} height={boxH}
        fill={lane.empty ? UNMARKED : bright} fillOpacity={lane.empty ? 0.5 : 1}
      />

      {/* The lane name, and how much of the board it owns. */}
      <text
        x={left - 16} y={y - 3}
        className="font-display" fontSize={21} fill={lane.empty ? UNMARKED : CHALK} textAnchor="end"
      >
        {lane.label}
      </text>
      <text
        x={left - 16} y={y + 16}
        fontSize={12} fill={lane.empty ? UNMARKED : bright} textAnchor="end" fillOpacity={0.9}
      >
        {lane.empty ? 'not yet covered' : `${lane.marks.length} changes`}
      </text>

      {/* The chalk centre line, in pieces. A break is the only thing that
          interrupts it: the line stops, steps, and resumes offset. */}
      <g
        className="lane-paint"
        style={{ ['--lane-length' as string]: `${length}`, animationDelay: `${index * 0.11}s` }}
      >
        {pieces.map((p, i) => (
          <line
            key={i}
            x1={p.x1} x2={p.x2} y1={y + p.dy} y2={y + p.dy}
            stroke={lane.empty ? UNMARKED : CHALK}
            strokeOpacity={lane.empty ? 0.4 : 0.9}
            strokeWidth={2}
            strokeDasharray={lane.empty ? '2 7' : undefined}
          />
        ))}
        {steps.map((s, i) => (
          <g key={i}>
            <line
              x1={s.x} x2={s.x} y1={y + s.from} y2={y + s.to}
              stroke={CHALK} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="3 3"
            />
            <text
              x={s.x} y={y - 42}
              className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.7} textAnchor="middle"
            >
              break {s.year}
            </text>
          </g>
        ))}
      </g>

      {lane.marks.map((m, i) => {
        const px = x(m.time)
        const above = labelSide[i]
        const dy = markOffset(pieces, px)
        const cause = causeMap[m.cause]
        const isSelected = selected === m.id
        const breaks = Boolean(m.breaksSeries)
        return (
          <g
            key={m.id}
            className="cursor-pointer"
            transform={`translate(${px}, ${y + dy})`}
            role="button"
            tabIndex={0}
            aria-label={`${m.year}. ${m.label} Cause: ${cause?.label ?? m.cause}.`}
            onClick={() => onSelect(isSelected ? null : m.id)}
            onMouseEnter={() => onHover({ x: px, y: y + dy, mark: m, lane })}
            onFocus={() => onHover({ x: px, y: y + dy, mark: m, lane })}
            onBlur={() => onHover(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(isSelected ? null : m.id)
              }
            }}
          >
            {/* A mark that severed a series wears a halo in the family colour;
                the step in the lane beside it says the same thing structurally,
                but the halo survives being looked at one mark at a time. */}
            {/* The positioning transform lives on the parent; this group owns
                the scale-in, because a CSS transform would otherwise overwrite
                the attribute one and stack every mark on the origin. */}
            <g
              className="mark-in"
              style={{ animationDelay: `${index * 0.11 + ((px - left) / length) * 1.2}s` }}
            >
              {breaks && <circle r={13} fill={bright} fillOpacity={0.22} />}
              {isSelected && (
                <circle r={15} fill="none" stroke={CHALK} strokeWidth={1.5} strokeOpacity={0.9} />
              )}
              <circle r={16} fill="transparent" />
              <g style={{ color: CHALK }}>
                <Mark
                  shape={cause?.mark ?? 'circle'}
                  size={6.4}
                  colour={m.cause === 'disputed' ? UNMARKED : CHALK}
                  withdrawn={withdrawn.has(m.id)}
                />
              </g>
              <text
                className="numeral"
                y={above ? -21 : 33}
                fontSize={15} fill={CHALK} fillOpacity={0.75} textAnchor="middle"
              >
                {m.year}
              </text>
            </g>
          </g>
        )
      })}
    </g>
  )
}

/**
 * How thickly the rule changes fall, in five-year buckets across every lane.
 * The clustering is the site's argument — broadcast-driven scoring rewrites
 * arriving in a wave, safety changes following deaths — and it is invisible
 * while the marks are spread over five separate lanes.
 */
function DensityStrip({
  marks, x, bounds, left, right, top, height,
}: {
  marks: TimelineMark[]
  x: (n: number) => number
  bounds: [number, number]
  left: number
  right: number
  top: number
  height: number
}) {
  const buckets = useMemo(() => {
    const size = 5
    const from = Math.floor(bounds[0] / size) * size
    const map = new Map<number, number>()
    for (const m of marks) {
      const b = Math.floor(m.year / size) * size
      map.set(b, (map.get(b) ?? 0) + 1)
    }
    const out: { year: number; n: number }[] = []
    for (let yr = from; yr < bounds[1]; yr += size) out.push({ year: yr, n: map.get(yr) ?? 0 })
    return out
  }, [marks, bounds])

  const peak = Math.max(1, ...buckets.map((b) => b.n))

  return (
    <g>
      <line x1={left} x2={right} y1={top + height} y2={top + height} stroke={CHALK} strokeOpacity={0.16} />
      {buckets.map((b, i) => {
        if (b.n === 0) return null
        const x1 = Math.max(left, x(b.year))
        const x2 = Math.min(right, x(b.year + 5))
        const bh = (b.n / peak) * height
        return (
          <rect
            key={b.year}
            x={x1 + 1}
            y={top + height - bh}
            width={Math.max(1, x2 - x1 - 2)}
            height={bh}
            fill={CHALK}
            fillOpacity={0.22 + 0.5 * (b.n / peak)}
            className="mark-in"
            style={{ animationDelay: `${0.5 + i * 0.02}s` }}
          >
            <title>{`${b.year}–${b.year + 4}: ${b.n} rule change${b.n === 1 ? '' : 's'}`}</title>
          </rect>
        )
      })}
      <text x={left} y={top - 2} fontSize={11} fill={UNMARKED} letterSpacing="0.16em">
        HOW THICKLY THEY FALL · FIVE-YEAR BUCKETS
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ vertical */

/**
 * Mobile is a different layout, not a shrunk one: time runs down a single
 * painted spine and the marks read as a list. A break still steps the line.
 */
function VerticalBoard({
  lanes, bounds, causeMap, withdrawn, selected, onSelect,
}: {
  lanes: Lane[]
  bounds: [number, number]
  causeMap: Record<CauseId, Cause>
  withdrawn: Set<string>
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const rows = lanes
    .flatMap((lane) =>
      lane.marks.map((m) => ({
        mark: m,
        lane,
        isBreak: lane.breaks.find((b) => b.ruleId === m.id),
      })),
    )
    .sort((a, b) => a.mark.time - b.mark.time)

  let lastDecade: number | null = null

  return (
    <ol className="ml-5 mr-3 border-l-2 border-chalk/20 py-2">
      {rows.map(({ mark, lane, isBreak }) => {
        const cause = causeMap[mark.cause]
        const bright = BRIGHT[lane.colour] ?? UNMARKED
        const isSelected = selected === mark.id
        const decade = Math.floor(mark.year / 10) * 10
        const newDecade = decade !== lastDecade
        lastDecade = decade
        return (
          <li key={mark.id} className="relative">
            {newDecade && (
              <p className="numeral -ml-5 mb-1 mt-4 bg-surface pl-1 pr-2 text-[13px] text-unmarked first:mt-0">
                {decade}s
              </p>
            )}
            {/* A break steps the spine here too, and nothing else may. */}
            {isBreak && (
              <span
                aria-hidden
                className="absolute -left-[2px] top-0 h-6 w-6 -translate-x-1/2 border-b-2 border-l-2 border-chalk/40"
              />
            )}
            <button
              type="button"
              onClick={() => onSelect(isSelected ? null : mark.id)}
              aria-pressed={isSelected}
              className={`flex w-full items-start gap-3 py-3 pl-4 pr-2 text-left transition-colors ${
                isSelected ? 'bg-chalk/10' : 'hover:bg-chalk/5'
              }`}
              style={{ borderLeft: `4px solid ${bright}` }}
            >
              <span className="numeral shrink-0 pt-0.5 text-[20px] text-chalk">{mark.year}</span>
              <span className="pt-1 text-chalk">
                <MarkGlyph
                  shape={cause?.mark ?? 'circle'}
                  label={cause?.label ?? mark.cause}
                  withdrawn={withdrawn.has(mark.id)}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] leading-snug text-chalk">{mark.label}</span>
                <span className="mt-0.5 block text-[13px] text-unmarked">
                  {lane.label} · {cause?.label ?? mark.cause}
                  {isBreak ? ` · break: ${BREAK_KIND_LABEL[isBreak.kind] ?? isBreak.kind}` : ''}
                </span>
              </span>
            </button>
          </li>
        )
      })}
      {rows.length === 0 && (
        <li className="py-4 pl-4 text-[15px] text-unmarked">
          Nothing on the board between {bounds[0]} and {bounds[1]} under these filters.
        </li>
      )}
    </ol>
  )
}

/* -------------------------------------------------------------------- detail */

/**
 * Clicking a mark opens the rule change in place. It does not navigate away
 * from the timeline; the link to the sport page is offered, never taken for you.
 */
function Detail({
  rule, sport, cause, breakInfo, sources, onClose,
}: {
  rule: RuleChange | null
  sport?: Sport
  cause?: Cause
  breakInfo?: Series
  sources: Source[]
  onClose: () => void
}) {
  if (!rule) return null
  const source = sources.find((s) => s.id === rule.citation.source)
  const incomplete = rule.citation.missing || !rule.citation.article
  const bright = BRIGHT[sport?.family_colour ?? 'unmarked'] ?? UNMARKED

  return (
    <aside
      key={rule.id}
      aria-live="polite"
      className="reveal is-in mt-5 border chalk-rule bg-surface/70 p-5 sm:p-7"
      style={{ borderTop: `3px solid ${bright}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="numeral text-[15px] text-unmarked">
            {rule.date_effective}
            {rule.date_adopted ? ` · adopted ${rule.date_adopted}` : ''}
          </p>
          <h3 className="mt-1 font-display text-fluid-h3 text-chalk">
            {sport?.label ?? rule.scope.sport}
          </h3>
          <p className="text-[14px] text-unmarked">{rule.governing_body}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 border border-chalk/25 px-3 py-1 text-[14px] text-chalk/80 transition-colors hover:border-chalk hover:text-chalk"
        >
          Close
        </button>
      </div>

      <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="prose-measure text-[16px] text-chalk/90">
          <p>{rule.what_changed}</p>
          {rule.trigger && (
            <>
              <p className="eyebrow mt-5">Trigger</p>
              <p className="mt-1">{rule.trigger.description}</p>
              {rule.trigger.also_said && (
                <p className="border-l-2 border-unmarked pl-4 text-chalk/75">
                  {rule.trigger.also_said}
                </p>
              )}
            </>
          )}
        </div>

        <dl className="min-w-[15rem] space-y-3 border-t border-chalk/15 pt-5 text-[14px] md:border-l md:border-t-0 md:pl-7 md:pt-0">
          <div>
            <dt className="text-unmarked">Cause</dt>
            <dd className="flex items-center gap-2 text-chalk">
              {cause && <MarkGlyph shape={cause.mark} label="" />}
              {cause?.label ?? rule.cause_primary}
            </dd>
          </div>
          {rule.cause_secondary && (
            <div>
              <dt className="text-unmarked">Secondary</dt>
              <dd className="text-chalk/80">{rule.cause_secondary}</dd>
            </div>
          )}
          {rule.status && rule.status !== 'adopted' && (
            <div>
              <dt className="text-unmarked">Status</dt>
              <dd className="text-chalk/80">
                {rule.status === 'withdrawn'
                  ? 'Adopted, then rescinded before it was enforced'
                  : 'Trialled, then abandoned'}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-unmarked">Citation</dt>
            <dd className={incomplete ? 'text-unmarked' : 'text-chalk/85'}>
              {source?.title ?? rule.citation.source}
              {rule.citation.edition ? <><br />{rule.citation.edition}</> : null}
              {rule.citation.article ? <><br />Article {rule.citation.article}</> : null}
              {incomplete && (
                <><br /><span className="text-unmarked">Incomplete — article not confirmed against the text.</span></>
              )}
            </dd>
          </div>
          {breakInfo && (
            <div>
              <dt className="text-unmarked">Comparability break</dt>
              <dd className="text-chalk/85">
                {BREAK_KIND_LABEL[breakInfo.break?.kind ?? 'none']}
                <br />
                <Link
                  href={`/breaks/#${breakInfo.id}`}
                  className="link-paint text-chalk"
                >
                  What it severed
                </Link>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-unmarked">Read more</dt>
            <dd>
              <Link href={`/sports/${rule.scope.sport}/`} className="link-paint text-chalk">
                {sport?.label ?? rule.scope.sport} in full
              </Link>
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
