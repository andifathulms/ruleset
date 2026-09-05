'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3'
import {
  BREAK_GUTTER, BREAK_KIND_LABEL, chartTitle, layoutSeries, type SegmentLayout,
} from '@/lib/series'
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

const BRIGHT: Record<string, string> = {
  pool: '#57ACE8',
  pitch: '#5CC684',
  clay: '#EA7E4E',
  gold: '#F2C94F',
  unmarked: '#9FB2B0',
}

/**
 * Each segment is a separate path with its own x and y scale, drawn inside its
 * own panel with its own y axis. The segments do not share a baseline, the axis
 * is interrupted by a hatched gutter, and there is no code path here that could
 * join them — the layout it consumes cannot express a joined series.
 */
export default function SeriesChart({
  series,
  colour = 'pool',
  now,
}: {
  series: Series
  colour?: string
  /**
   * The year an open-ended segment runs to. Passed in from the server rather
   * than read from the clock here: this is a static export, so the client would
   * otherwise compute a different year from the one baked into the HTML.
   */
  now: number
}) {
  const layout = useMemo(() => layoutSeries(series, now), [series, now])
  const [width, setWidth] = useState(880)
  const [live, setLive] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  // The record draws itself once, when the reader reaches it.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setLive(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const family = SURFACE[colour] ?? UNMARKED
  const bright = BRIGHT[colour] ?? UNMARKED
  const title = chartTitle(series)
  const uid = series.id

  // Rule 5. Where a series cannot exist, prose occupies the space a chart
  // would, framed in `unmarked` and styled as content, not as an error.
  if (layout.kind === 'absent') {
    return (
      <figure ref={wrap} className="my-10">
        <figcaption className="mb-4">
          <p className="eyebrow">
            {series.absence_kind === 'impossible' ? 'No series can exist' : 'No series published'}
          </p>
          <h3 className="mt-1.5 font-display text-fluid-h3 text-chalk">{title}</h3>
        </figcaption>
        <div className="relative overflow-hidden border-2 border-dashed border-unmarked/50 bg-surface/30 p-6 sm:p-10">
          {/* The space a chart would have taken, holding the reason instead. */}
          <div className="prose-measure text-fluid-base text-chalk/85">
            {layout.reason.trim().split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p.replace(/\s+/g, ' ')}</p>
            ))}
          </div>
          {series.break && (
            <p className="mt-7 flex flex-wrap items-baseline gap-x-3 border-t border-unmarked/40 pt-5 text-[14px] text-unmarked">
              <span className="numeral text-[22px] text-chalk">{series.break.at}</span>
              <span className="font-display text-[17px] text-chalk">
                {BREAK_KIND_LABEL[series.break.kind] ?? series.break.kind}
              </span>
              <span className="max-w-measure">{series.break.note.replace(/\s+/g, ' ')}</span>
            </p>
          )}
        </div>
      </figure>
    )
  }

  const w = Math.max(width, 320)
  const stacked = w < 640
  const h = stacked ? 190 * layout.segments.length + 40 : 380
  const pad = { top: 30, right: 14, bottom: 56, left: 56 }

  return (
    <figure ref={wrap} className="my-10">
      <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="font-display text-fluid-h3 text-chalk">{title}</h3>
        <p className="text-[14px] text-unmarked">
          {series.unit === 's' ? 'Seconds — lower is better.' : `Measured in ${series.unit}.`}
          {series.break
            ? ` Broken at ${series.break.at}: ${BREAK_KIND_LABEL[series.break.kind]}.`
            : ''}
        </p>
      </figcaption>

      <div className="border chalk-rule bg-surface/40 p-1">
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={describe(series, layout.segments)}
          className="block"
        >
          <defs>
            <linearGradient id={`panel-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={family} stopOpacity="0.2" />
              <stop offset="1" stopColor={family} stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={bright} stopOpacity="0.34" />
              <stop offset="1" stopColor={bright} stopOpacity="0.02" />
            </linearGradient>
            {/* The gutter is hatched, not blank: a severance that was drawn on
                purpose, rather than a region where the data ran out. */}
            <pattern
              id={`hatch-${uid}`}
              width="9"
              height="9"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="9" stroke={CHALK} strokeOpacity="0.16" strokeWidth="2" />
            </pattern>
          </defs>

          {layout.segments.map((seg, i) => {
            const box = stacked
              ? {
                  x: pad.left,
                  y: 24 + i * 190,
                  w: w - pad.left - pad.right,
                  h: 190 - 56,
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
                uid={uid}
                bright={bright}
                unit={layout.unit}
                higherIsBetter={layout.higherIsBetter}
                live={live}
                delay={i * 0.35}
                first={i === 0}
              />
            )
          })}

          {/* The gutter. The eye must not be able to complete the line. */}
          {series.break && layout.segments.length > 1 && !stacked && (
            <BreakGutter
              uid={uid}
              x={pad.left + layout.segments[0].widthFraction * (w - pad.left - pad.right)}
              width={BREAK_GUTTER * (w - pad.left - pad.right)}
              top={pad.top}
              bottom={h - pad.bottom}
              year={series.break.at}
            />
          )}
          {series.break && layout.segments.length > 1 && stacked && (
            <g>
              <rect
                x={pad.left} y={24 + 190 - 40} width={w - pad.left - pad.right} height={16}
                fill={`url(#hatch-${uid})`}
              />
              <line
                x1={pad.left} x2={w - pad.right} y1={24 + 190 - 40} y2={24 + 190 - 40}
                stroke={CHALK} strokeOpacity={0.4} strokeDasharray="4 5"
              />
              <line
                x1={pad.left} x2={w - pad.right} y1={24 + 190 - 24} y2={24 + 190 - 24}
                stroke={CHALK} strokeOpacity={0.4} strokeDasharray="4 5"
              />
              <text
                x={pad.left} y={24 + 190 - 6}
                className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.75}
              >
                break {series.break.at} — not comparable across this line
              </text>
            </g>
          )}
        </svg>
      </div>

      {series.break && (
        <p className="mt-4 max-w-measure border-l-2 border-chalk/40 pl-4 text-[15px] text-chalk/80">
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
  seg, box, uid, bright, unit, higherIsBetter, live, delay, first,
}: {
  seg: SegmentLayout
  box: { x: number; y: number; w: number; h: number }
  uid: string
  bright: string
  unit: string
  higherIsBetter: boolean
  live: boolean
  delay: number
  /** Only the leftmost panel has room outside itself for its own y axis. */
  first: boolean
}) {
  const x = scaleLinear().domain(seg.xDomain).range([box.x + 8, box.x + box.w - 8])
  // Own y domain. Two segments never share a baseline, and each panel now
  // prints its own, so the reader can see that they do not.
  const y = higherIsBetter
    ? scaleLinear().domain(seg.yDomain).range([box.y + box.h, box.y])
    : scaleLinear().domain(seg.yDomain).range([box.y, box.y + box.h])

  // Record progressions are stepped: a record holds until it is beaten.
  const steps: string[] = []
  seg.points.forEach((p, i) => {
    const px = x(p.year)
    const py = y(p.value)
    if (i === 0) steps.push(`M${px},${py}`)
    else {
      const prev = seg.points[i - 1]
      steps.push(`L${px},${y(prev.value)}`, `L${px},${py}`)
    }
  })
  if (seg.points.length) {
    steps.push(`L${x(seg.to)},${y(seg.points[seg.points.length - 1].value)}`)
  }
  const line = steps.join('')
  // The area is closed to the panel floor, never to a shared one.
  const area = seg.points.length
    ? `${line}L${x(seg.to)},${box.y + box.h}L${x(seg.points[0].year)},${box.y + box.h}Z`
    : ''

  const yTicks = seg.points.length ? [seg.yDomain[0], seg.yDomain[1]] : []

  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={`url(#panel-${uid})`} />

      {/* This panel's own baseline and ceiling, labelled. */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={box.x} x2={box.x + box.w} y1={y(t)} y2={y(t)}
            stroke={CHALK} strokeOpacity={0.09} strokeDasharray="2 4"
          />
          <text
            x={first ? box.x - 7 : box.x + 7}
            y={first ? y(t) + 4 : y(t) + (y(t) > box.y + box.h / 2 ? -6 : 13)}
            className="numeral" fontSize={11} fill={UNMARKED}
            textAnchor={first ? 'end' : 'start'}
          >
            {format(t, unit)}
          </text>
        </g>
      ))}

      {seg.points.length === 0 ? (
        <foreignObject x={box.x} y={box.y} width={Math.max(0, box.w)} height={Math.max(0, box.h)}>
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden p-4 text-center text-[13px] leading-snug text-unmarked"
            style={{ maxWidth: box.w }}
          >
            {seg.note?.replace(/\s+/g, ' ') ?? 'No points recorded in this segment.'}
          </div>
        </foreignObject>
      ) : (
        <>
          <path
            d={area}
            fill={`url(#area-${uid})`}
            style={{ opacity: live ? 1 : 0, transition: `opacity .8s ${delay + 0.5}s linear` }}
          />
          <path
            d={line}
            fill="none"
            stroke={CHALK}
            strokeWidth={2.25}
            strokeLinejoin="miter"
            className={live ? 'draw-path' : undefined}
            style={{
              ['--path-length' as string]: '2600',
              strokeDasharray: 2600,
              strokeDashoffset: live ? undefined : 2600,
              animationDelay: `${delay}s`,
              animationDuration: '1.3s',
            }}
          />
          {seg.points.map((p, i) => (
            <g
              key={`${p.year}-${p.value}`}
              className="chart-point"
              style={{ opacity: live ? 1 : 0, transition: `opacity .3s ${delay + 0.35 + i * 0.05}s linear` }}
            >
              <circle cx={x(p.year)} cy={y(p.value)} r={9} fill="transparent" />
              <circle
                cx={x(p.year)} cy={y(p.value)} r={3.6}
                fill={CHALK} stroke={bright} strokeWidth={0}
              />
              <title>
                {`${p.year} — ${format(p.value, unit)}${p.holder ? `, ${p.holder}` : ''}`}
              </title>
            </g>
          ))}
          {/* The last value is labelled, so the panel reads without hover. The
              first is labelled too where the two would not collide. */}
          {seg.points.length > 1 && x(seg.points[1].year) - x(seg.points[0].year) > 54 && (
            <text
              x={x(seg.points[0].year) + 6} y={clamp(y(seg.points[0].value) - 10, box)}
              className="numeral" fontSize={12} fill={CHALK} fillOpacity={0.65}
            >
              {format(seg.points[0].value, unit)}
            </text>
          )}
          <text
            x={box.x + box.w - 6}
            y={clamp(y(seg.points[seg.points.length - 1].value) - 10, box)}
            className="numeral" fontSize={15} fill={CHALK} textAnchor="end"
          >
            {format(seg.points[seg.points.length - 1].value, unit)}
          </text>
        </>
      )}

      {[seg.from, seg.to].map((t, i) => (
        <text
          key={t}
          x={i === 0 ? box.x : box.x + box.w}
          y={box.y + box.h + 19}
          className="numeral" fontSize={13} fill={CHALK} fillOpacity={0.6}
          textAnchor={i === 0 ? 'start' : 'end'}
        >
          {t}
        </text>
      ))}
    </g>
  )
}

/** Keeps a value label inside its own panel rather than over the axis. */
function clamp(y: number, box: { y: number; h: number }): number {
  return Math.min(Math.max(y, box.y + 13), box.y + box.h - 5)
}

function BreakGutter({
  uid, x, width, top, bottom, year,
}: {
  uid: string
  x: number
  width: number
  top: number
  bottom: number
  year: number
}) {
  const mid = x + width / 2
  return (
    <g>
      <rect x={x} y={top} width={width} height={bottom - top} fill={`url(#hatch-${uid})`} />
      <line x1={x} x2={x} y1={top - 12} y2={bottom + 6} stroke={CHALK} strokeOpacity={0.45} strokeDasharray="4 5" />
      <line
        x1={x + width} x2={x + width} y1={top - 12} y2={bottom + 6}
        stroke={CHALK} strokeOpacity={0.45} strokeDasharray="4 5"
      />
      <text
        x={mid} y={top - 18}
        className="numeral" fontSize={14} fill={CHALK} fillOpacity={0.85} textAnchor="middle"
      >
        {year}
      </text>
      <text
        x={mid} y={bottom + 40}
        fontSize={11} fill={UNMARKED} textAnchor="middle" letterSpacing="0.1em"
      >
        NOT COMPARABLE
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
  if (unit === 's') return v.toFixed(2)
  return Number.isInteger(v) ? `${v}` : v.toFixed(2)
}

function describe(series: Series, segments: SegmentLayout[]): string {
  const parts = segments.map((s) =>
    s.points.length
      ? `${s.from} to ${s.to}: ${s.points.length} marks, from ${format(s.points[0].value, series.unit)} to ${format(s.points[s.points.length - 1].value, series.unit)} ${series.unit}`
      : `${s.from} onwards: no marks recorded`,
  )
  return `${chartTitle(series)}. Drawn as ${segments.length} separate segments that are not comparable with each other. ${parts.join('. ')}.`
}
