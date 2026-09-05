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

const SURFACE: Record<string, string> = {
  pool: '#1D6FA8',
  pitch: '#2F7D4F',
  clay: '#B7502A',
  gold: '#C8A02C',
  unmarked: '#7A8C8A',
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

const LANE_H = 92
const PAD = { top: 34, right: 24, bottom: 44, left: 128 }

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
  const drawn = lanes.filter((l) => !l.empty || l.members.length > 0)

  const vertical = width > 0 && width < 760
  const selectedRule = selected ? ruleMap[selected] : null

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
        onToggleCause={toggleCause}
        onClearCauses={() => setActiveCauses([])}
        bounds={bounds}
        fullDomain={[Math.floor(fullDomain[0]), Math.ceil(fullDomain[1])]}
        onRange={setRange}
      />

      <p className="mt-3 max-w-measure text-[14px] text-unmarked">{lens.blurb}</p>

      {vertical ? (
        <VerticalBoard
          lanes={drawn}
          bounds={bounds}
          causeMap={causeMap}
          withdrawn={withdrawn}
          selected={selected}
          onSelect={setSelected}
        />
      ) : (
        <HorizontalBoard
          key={lensId}
          lanes={drawn}
          bounds={bounds}
          width={width}
          causeMap={causeMap}
          withdrawn={withdrawn}
          selected={selected}
          onSelect={setSelected}
        />
      )}

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

/* ------------------------------------------------------------------ controls */

function Controls({
  lenses, lensId, onLens, causes, active, onToggleCause, onClearCauses, bounds, fullDomain, onRange,
}: {
  lenses: Lens[]
  lensId: string
  onLens: (id: string) => void
  causes: Cause[]
  active: CauseId[]
  onToggleCause: (id: CauseId) => void
  onClearCauses: () => void
  bounds: [number, number]
  fullDomain: [number, number]
  onRange: (r: [number, number] | null) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-[13px] uppercase tracking-[0.14em] text-unmarked">
          Classification lens
        </legend>
        <div className="flex flex-wrap gap-2">
          {lenses.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onLens(l.id)}
              aria-pressed={l.id === lensId}
              className={`font-display px-3 py-1.5 text-[16px] tracking-wide transition-colors ${
                l.id === lensId
                  ? 'bg-chalk text-surface'
                  : 'border border-chalk/25 text-chalk/75 hover:border-chalk/60 hover:text-chalk'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[13px] uppercase tracking-[0.14em] text-unmarked">
          Cause — shape, not colour
        </legend>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {causes.map((c) => {
            const on = active.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggleCause(c.id)}
                aria-pressed={on}
                title={c.definition}
                className={`flex items-center gap-1.5 text-[14px] transition-opacity ${
                  active.length && !on ? 'opacity-40' : 'opacity-100'
                } hover:opacity-100`}
              >
                <span className={on ? 'text-chalk' : 'text-chalk/80'}>
                  <MarkGlyph shape={c.mark} label="" />
                </span>
                <span className={on ? 'text-chalk underline underline-offset-4' : 'text-chalk/75'}>
                  {c.label}
                </span>
              </button>
            )
          })}
          {active.length > 0 && (
            <button
              type="button"
              onClick={onClearCauses}
              className="text-[13px] text-unmarked underline underline-offset-4 hover:text-chalk"
            >
              Clear
            </button>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[13px] uppercase tracking-[0.14em] text-unmarked">
          Date range
        </legend>
        <div className="flex flex-wrap items-center gap-3 text-[14px]">
          <label className="flex items-center gap-2">
            <span className="text-unmarked">From</span>
            <input
              type="number"
              value={bounds[0]}
              min={fullDomain[0]}
              max={bounds[1]}
              step={1}
              onChange={(e) => onRange([Number(e.target.value), bounds[1]])}
              className="numeral w-24 border border-chalk/25 bg-transparent px-2 py-1 text-chalk"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-unmarked">To</span>
            <input
              type="number"
              value={bounds[1]}
              min={bounds[0]}
              max={fullDomain[1]}
              step={1}
              onChange={(e) => onRange([bounds[0], Number(e.target.value)])}
              className="numeral w-24 border border-chalk/25 bg-transparent px-2 py-1 text-chalk"
            />
          </label>
          <button
            type="button"
            onClick={() => onRange(null)}
            className="text-[13px] text-unmarked underline underline-offset-4 hover:text-chalk"
          >
            Reset
          </button>
        </div>
      </fieldset>
    </div>
  )
}

/* ---------------------------------------------------------------- horizontal */

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
  const w = Math.max(width, 640)
  const h = PAD.top + lanes.length * LANE_H + PAD.bottom
  const x = scaleLinear().domain(bounds).range([PAD.left, w - PAD.right])

  const ticks = x.ticks(Math.max(4, Math.floor((w - PAD.left) / 110)))

  return (
    <div className="mt-6 overflow-x-auto">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Rule changes on ${lanes.length} lanes between ${bounds[0]} and ${bounds[1]}. Each lane is a group of sports; each mark is a rule change; a step in a lane is a comparability break.`}
        className="block"
      >
        {/* Year axis, set large — years are display type. */}
        <g>
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={x(t)} x2={x(t)} y1={PAD.top - 14} y2={h - PAD.bottom + 8}
                stroke={CHALK} strokeOpacity={0.08}
              />
              <text
                x={x(t)} y={PAD.top - 20}
                className="numeral"
                fontSize={19} fill={CHALK} fillOpacity={0.55} textAnchor="middle"
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
            y={PAD.top + i * LANE_H + LANE_H / 2}
            x={x}
            bounds={bounds}
            left={PAD.left}
            right={w - PAD.right}
            index={i}
            causeMap={causeMap}
            withdrawn={withdrawn}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </svg>
    </div>
  )
}

function LaneRow({
  lane, y, x, bounds, left, right, index, causeMap, withdrawn, selected, onSelect,
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
}) {
  const colour = SURFACE[lane.colour] ?? UNMARKED
  const { pieces, steps } = laneLinePieces(lane, x, bounds)
  const length = right - left

  return (
    <g>
      {/* The lane is painted in the family colour at low opacity. */}
      <rect
        x={left} y={y - LANE_H / 2 + 10} width={Math.max(0, right - left)} height={LANE_H - 20}
        fill={colour} fillOpacity={0.16}
      />

      <text
        x={left - 14} y={y - 4}
        className="font-display" fontSize={20} fill={CHALK} textAnchor="end"
      >
        {lane.label}
      </text>
      <text
        x={left - 14} y={y + 14}
        fontSize={12} fill={UNMARKED} textAnchor="end"
      >
        {lane.members.length ? `${lane.marks.length} changes` : 'not yet covered'}
      </text>

      {/* The chalk centre line, in pieces. A break is the only thing that
          interrupts it: the line stops, steps, and resumes offset. */}
      <g
        className="lane-paint"
        style={{ ['--lane-length' as string]: `${length}`, animationDelay: `${index * 0.09}s` }}
      >
        {pieces.map((p, i) => (
          <line
            key={i}
            x1={p.x1} x2={p.x2} y1={y + p.dy} y2={y + p.dy}
            stroke={CHALK} strokeOpacity={0.85} strokeWidth={2}
          />
        ))}
        {steps.map((s, i) => (
          <g key={i}>
            <line
              x1={s.x} x2={s.x} y1={y + s.from} y2={y + s.to}
              stroke={CHALK} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="3 3"
            />
            <text
              x={s.x} y={y - 26}
              className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.7} textAnchor="middle"
            >
              break {s.year}
            </text>
          </g>
        ))}
      </g>

      {lane.marks.map((m, i) => {
        const px = x(m.time)
        const dy = markOffset(pieces, px)
        const cause = causeMap[m.cause]
        const isSelected = selected === m.id
        return (
          <g
            key={m.id}
            className="mark-in cursor-pointer"
            style={{ animationDelay: `${index * 0.09 + (px - left) / length * 1.2}s` }}
            transform={`translate(${px}, ${y + dy})`}
            role="button"
            tabIndex={0}
            aria-label={`${m.year}. ${m.label} Cause: ${cause?.label ?? m.cause}.`}
            onClick={() => onSelect(isSelected ? null : m.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(isSelected ? null : m.id)
              }
            }}
          >
            {isSelected && <circle r={13} fill="none" stroke={CHALK} strokeWidth={1.5} />}
            <circle r={13} fill="transparent" />
            <g style={{ color: CHALK }}>
              <Mark
                shape={cause?.mark ?? 'circle'}
                colour={m.cause === 'disputed' ? UNMARKED : CHALK}
                withdrawn={withdrawn.has(m.id)}
              />
            </g>
            <text
              className="numeral"
              y={i % 2 === 0 ? -19 : 30}
              fontSize={15} fill={CHALK} fillOpacity={0.8} textAnchor="middle"
            >
              {m.year}
            </text>
          </g>
        )
      })}
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

  return (
    <ol className="mt-6 border-l-2 border-chalk/25 pl-0">
      {rows.map(({ mark, lane, isBreak }) => {
        const cause = causeMap[mark.cause]
        const colour = SURFACE[lane.colour] ?? UNMARKED
        const isSelected = selected === mark.id
        return (
          <li key={mark.id} className="relative">
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
              style={{ borderLeft: `4px solid ${colour}` }}
            >
              <span className="numeral shrink-0 pt-0.5 text-[19px] text-chalk">{mark.year}</span>
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

  return (
    <aside
      aria-live="polite"
      className="mt-8 border-t-2 border-chalk/30 bg-chalk/[0.04] p-5 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="numeral text-[15px] text-unmarked">
            {rule.date_effective}
            {rule.date_adopted ? ` · adopted ${rule.date_adopted}` : ''}
          </p>
          <h3 className="mt-1 font-display text-3xl text-chalk">
            {sport?.label ?? rule.scope.sport}
          </h3>
          <p className="text-[14px] text-unmarked">{rule.governing_body}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 border border-chalk/25 px-3 py-1 text-[14px] text-chalk/80 hover:border-chalk/60 hover:text-chalk"
        >
          Close
        </button>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="prose-measure text-[16px] text-chalk/90">
          <p>{rule.what_changed}</p>
          {rule.trigger && (
            <>
              <p className="mt-4 text-[13px] uppercase tracking-[0.14em] text-unmarked">Trigger</p>
              <p>{rule.trigger.description}</p>
              {rule.trigger.also_said && (
                <p className="border-l-2 border-unmarked pl-4 text-chalk/75">
                  {rule.trigger.also_said}
                </p>
              )}
            </>
          )}
        </div>

        <dl className="min-w-[15rem] space-y-3 text-[14px]">
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
                  className="underline underline-offset-4 hover:text-chalk"
                >
                  What it severed
                </Link>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-unmarked">Read more</dt>
            <dd>
              <Link
                href={`/sports/${rule.scope.sport}/`}
                className="text-chalk underline underline-offset-4"
              >
                {sport?.label ?? rule.scope.sport} in full
              </Link>
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
