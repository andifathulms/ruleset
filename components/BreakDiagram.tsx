'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The site's whole argument as one graphic: a painted line runs, stops, steps,
 * and resumes offset. Nothing is drawn across the gap, and the two halves do
 * not share a baseline — so the eye cannot complete the line, which is exactly
 * what a comparability break does to a number series.
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
  const ref = useRef<SVGSVGElement>(null)
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

  const before = 'M0,58 H300'
  const step = 'M300,58 V34'
  const after = 'M334,34 H700'

  return (
    <svg
      ref={ref}
      viewBox="0 0 700 96"
      role="img"
      aria-label="A painted line runs, stops at a break, steps up, and resumes offset. Nothing is drawn across the gap."
      className={`w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="bd-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#F2F5F1" stopOpacity="0.25" />
          <stop offset="0.35" stopColor="#F2F5F1" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <path
        d={before}
        stroke="url(#bd-fade)"
        strokeWidth="2.5"
        fill="none"
        className={go ? 'draw-path' : undefined}
        style={{ ['--path-length' as string]: '300', strokeDashoffset: go ? undefined : 300, strokeDasharray: 300 }}
      />
      <path
        d={step}
        stroke="#F2F5F1"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        style={{ opacity: go ? 1 : 0, transition: 'opacity .3s .95s linear' }}
      />
      <path
        d={after}
        stroke="#F2F5F1"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        fill="none"
        className={go ? 'draw-path' : undefined}
        style={{
          ['--path-length' as string]: '366',
          strokeDasharray: 366,
          strokeDashoffset: go ? undefined : 366,
          animationDelay: '1.05s',
        }}
      />

      {labelled && (
        <text
          x="317"
          y="88"
          className="numeral"
          fontSize="13"
          fill="#F2F5F1"
          fillOpacity="0.55"
          textAnchor="middle"
          style={{ opacity: go ? 1 : 0, transition: 'opacity .4s 1.3s linear' }}
        >
          break
        </text>
      )}
    </svg>
  )
}
