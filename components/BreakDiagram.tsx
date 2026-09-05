'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The site's whole argument as one graphic: a painted line runs, stops, steps,
 * and resumes offset. Nothing is drawn across the gap, and the two halves do
 * not share a baseline — so the eye cannot complete the line, which is exactly
 * what a comparability break does to a number series.
 *
 * The label is HTML rather than SVG text: inside a viewBox it scaled with the
 * drawing and went illegible wherever the diagram sat in a narrow column.
 *
 * It paints once when it arrives on screen and then holds. Under
 * prefers-reduced-motion it is simply there, already painted.
 */
export default function BreakDiagram({
  className = '',
  labelled = true,
}: {
  className?: string
  labelled?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [go, setGo] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setGo(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setGo(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The break sits at 54% of the width; the label is hung from the same figure.
  const BREAK_AT = 54

  return (
    <div ref={ref} className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 80"
        role="img"
        aria-label="A painted line runs, stops at a break, steps up, and resumes on a different baseline. Nothing is drawn across the gap."
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M4,54 H210"
          stroke="#F2F5F1"
          strokeOpacity="0.9"
          strokeWidth="2.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
          className={go ? 'draw-path' : undefined}
          style={{
            ['--path-length' as string]: '206',
            strokeDasharray: 206,
            strokeDashoffset: go ? undefined : 206,
          }}
        />
        <path
          d="M210,54 V30"
          stroke="#F2F5F1"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: go ? 1 : 0, transition: 'opacity .3s .95s linear' }}
        />
        <path
          d="M232,30 H396"
          stroke="#F2F5F1"
          strokeOpacity="0.9"
          strokeWidth="2.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
          className={go ? 'draw-path' : undefined}
          style={{
            ['--path-length' as string]: '164',
            strokeDasharray: 164,
            strokeDashoffset: go ? undefined : 164,
            animationDelay: '1.05s',
          }}
        />
      </svg>

      {labelled && (
        <span
          className="numeral absolute bottom-0 -translate-x-1/2 text-[12px] text-chalk/60"
          style={{
            left: `${BREAK_AT}%`,
            opacity: go ? 1 : 0,
            transition: 'opacity .4s 1.3s linear',
          }}
        >
          break
        </span>
      )}
    </div>
  )
}
