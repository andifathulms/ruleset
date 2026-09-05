'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3'
import { BREAK_KIND_LABEL, chartTitle, layoutSeries, type SegmentLayout } from '@/lib/series'
import type { Series } from '@/lib/types'

const CHALK = '#F2F5F1'
const UNMARKED = '#7A8C8A'

const SURFACE: Record<string, string> = {
  pool: '#1D6FA8',
  pitch: '#2F7D4F',
  clay: '#B7502A',
  gold: '#C8A02C',
  unmarked: '#7A8C8A',
}

/**
 * Each segment is a separate path with its own x and y scale, drawn inside its
 * own panel. The segments do not share a baseline, the axis is interrupted by a
 * visible gutter, and there is no code path here that could join them — the
 * layout it consumes cannot express a joined series.
 */
export default function SeriesChart({
  series,
  colour = 'pool',
}: {
  series: Series
  colour?: string
}) {
  const layout = useMemo(() => layoutSeries(series), [series])
  const [width, setWidth] = useState(880)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const family = SURFACE[colour] ?? UNMARKED
  const title = chartTitle(series)

  // Rule 5. Where a series cannot exist, prose occupies the space a chart
  // would, framed in `unmarked` and styled as content, not as an error.
  if (layout.kind === 'absent') {
    return (
      <figure ref={wrap} className="my-10">
        <figcaption className="mb-3">
          <h3 className="font-display text-2xl text-chalk">{title}</h3>
          <p className="text-[14px] text-unmarked">
            {series.absence_kind === 'impossible'
              ? 'No chart. No series can exist here.'
              : 'No chart yet. A series could exist; none is published.'}
          </p>
        </figcaption>
        <div className="border-2 border-unmarked/60 p-6 sm:p-8">
          <div className="prose-measure text-[16px] text-chalk/85">
            {layout.reason.trim().split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p.replace(/\s+/g, ' ')}</p>
            ))}
          </div>
          {series.break && (
            <p className="mt-6 border-t border-unmarked/40 pt-4 text-[14px] text-unmarked">
              <span className="numeral text-chalk">{series.break.at}</span>
              {' · '}
              {BREAK_KIND_LABEL[series.break.kind] ?? series.break.kind}
              {' — '}
              {series.break.note.replace(/\s+/g, ' ')}
            </p>
          )}
        </div>
      </figure>
    )
  }

  const w = Math.max(width, 320)
  const stacked = w < 640
  const h = stacked ? 150 * layout.segments.length + 46 : 320
  const pad = { top: 26, right: 12, bottom: 34, left: 46 }

  return (
    <figure ref={wrap} className="my-10">
      <figcaption className="mb-3">
        <h3 className="font-display text-2xl text-chalk">{title}</h3>
        <p className="text-[14px] text-unmarked">
          {series.unit === 's' ? 'Seconds — lower is better.' : `Measured in ${series.unit}.`}
          {series.break ? ` Broken at ${series.break.at}: ${BREAK_KIND_LABEL[series.break.kind]}.` : ''}
        </p>
      </figcaption>

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={describe(series, layout.segments)}
        className="block"
      >
        {layout.segments.map((seg, i) => {
          const box = stacked
            ? {
                x: pad.left,
                y: 46 + i * 150,
                w: w - pad.left - pad.right,
                h: 150 - 34,
              }
            : {
                x: pad.left + seg.offsetFraction * (w - pad.left - pad.right),
                y: pad.top,
                w: seg.widthFraction * (w - pad.left - pad.right),
                h: h - pad.top - pad.bottom,
              }
          return (
            <SegmentPanel
              key={seg.id}
              seg={seg}
              box={box}
              family={family}
              unit={layout.unit}
              higherIsBetter={layout.higherIsBetter}
            />
          )
        })}

        {/* The gutter. The eye must not be able to complete the line. */}
        {series.break && layout.segments.length > 1 && !stacked && (
          <BreakGutter
            x={pad.left + (layout.segments[0].widthFraction + 0.5 * 0.07) * (w - pad.left - pad.right)}
            top={pad.top - 14}
            bottom={h - pad.bottom + 10}
            year={series.break.at}
          />
        )}
        {series.break && layout.segments.length > 1 && stacked && (
          <g>
            <line
              x1={pad.left} x2={w - pad.right} y1={46 + 150 - 20} y2={46 + 150 - 20}
              stroke={CHALK} strokeOpacity={0.35} strokeDasharray="4 5"
            />
            <text
              x={pad.left} y={46 + 150 - 7}
              className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.7}
            >
              break {series.break.at} — not comparable across this line
            </text>
          </g>
        )}
      </svg>

      {series.break && (
        <p className="mt-3 max-w-measure border-l-2 border-chalk/40 pl-4 text-[15px] text-chalk/80">
          {series.break.note.replace(/\s+/g, ' ')}
        </p>
      )}
      {series.competition && (
        <p className="mt-3 text-[14px] text-unmarked">
          Scoped to {series.competition}. This is not a figure for the sport.
        </p>
      )}
    </figure>
  )
}

function SegmentPanel({
  seg, box, family, unit, higherIsBetter,
}: {
  seg: SegmentLayout
  box: { x: number; y: number; w: number; h: number }
  family: string
  unit: string
  higherIsBetter: boolean
}) {
  const x = scaleLinear().domain(seg.xDomain).range([box.x + 6, box.x + box.w - 6])
  // Own y domain. Two segments never share a baseline.
  const y = scaleLinear().domain(seg.yDomain).range([box.y + box.h, box.y])
  const yy = higherIsBetter ? y : scaleLinear().domain(seg.yDomain).range([box.y, box.y + box.h])

  // Record progressions are stepped: a record holds until it is beaten.
  const steps: string[] = []
  seg.points.forEach((p, i) => {
    const px = x(p.year)
    const py = yy(p.value)
    if (i === 0) steps.push(`M${px},${py}`)
    else {
      const prev = seg.points[i - 1]
      steps.push(`L${px},${yy(prev.value)}`, `L${px},${py}`)
    }
  })
  if (seg.points.length) {
    steps.push(`L${x(seg.to)},${yy(seg.points[seg.points.length - 1].value)}`)
  }

  const ticks = [seg.from, seg.to]

  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={family} fillOpacity={0.14} />

      {seg.points.length === 0 ? (
        <foreignObject x={box.x} y={box.y} width={box.w} height={box.h}>
          <div className="flex h-full items-center justify-center p-3 text-center text-[13px] leading-snug text-unmarked">
            {seg.note?.replace(/\s+/g, ' ') ?? 'No points recorded in this segment.'}
          </div>
        </foreignObject>
      ) : (
        <>
          <path d={steps.join('')} fill="none" stroke={CHALK} strokeWidth={2} strokeLinejoin="miter" />
          {seg.points.map((p) => (
            <g key={`${p.year}-${p.value}`}>
              <circle cx={x(p.year)} cy={yy(p.value)} r={3.4} fill={CHALK} />
              <title>
                {`${p.year} — ${format(p.value, unit)}${p.holder ? `, ${p.holder}` : ''}`}
              </title>
            </g>
          ))}
          {/* First and last value labelled, so the panel reads without hover. */}
          <text
            x={x(seg.points[0].year)} y={yy(seg.points[0].value) - 9}
            className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.75}
          >
            {format(seg.points[0].value, unit)}
          </text>
          <text
            x={box.x + box.w - 6}
            y={yy(seg.points[seg.points.length - 1].value) - 9}
            className="numeral" fontSize={13} fill={CHALK} textAnchor="end"
          >
            {format(seg.points[seg.points.length - 1].value, unit)}
          </text>
        </>
      )}

      {ticks.map((t, i) => (
        <text
          key={t}
          x={i === 0 ? box.x : box.x + box.w}
          y={box.y + box.h + 17}
          className="numeral" fontSize={13} fill={CHALK} fillOpacity={0.6}
          textAnchor={i === 0 ? 'start' : 'end'}
        >
          {t}
        </text>
      ))}
    </g>
  )
}

function BreakGutter({ x, top, bottom, year }: { x: number; top: number; bottom: number; year: number }) {
  return (
    <g>
      <line x1={x} x2={x} y1={top} y2={bottom} stroke={CHALK} strokeOpacity={0.4} strokeDasharray="4 5" />
      <text
        x={x} y={top - 4}
        className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.8} textAnchor="middle"
      >
        {year}
      </text>
      <text
        x={x} y={bottom + 16}
        fontSize={11} fill={UNMARKED} textAnchor="middle"
      >
        not comparable
      </text>
    </g>
  )
}

function format(v: number, unit: string): string {
  if (unit === 's' && v >= 60) {
    const m = Math.floor(v / 60)
    const s = v - m * 60
    return `${m}:${s.toFixed(2).padStart(5, '0')}`
  }
  return unit === 's' ? v.toFixed(2) : `${v}`
}

function describe(series: Series, segments: SegmentLayout[]): string {
  const parts = segments.map((s) =>
    s.points.length
      ? `${s.from} to ${s.to}: ${s.points.length} marks, from ${format(s.points[0].value, series.unit)} to ${format(s.points[s.points.length - 1].value, series.unit)} ${series.unit}`
      : `${s.from} onwards: no marks recorded`,
  )
  return `${chartTitle(series)}. Drawn as ${segments.length} separate segments that are not comparable with each other. ${parts.join('. ')}.`
}
