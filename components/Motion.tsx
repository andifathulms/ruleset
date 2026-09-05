'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

/** True when the reader has asked the operating system for less motion. */
function prefersReduced(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Reveals its children as they arrive in the viewport.
 *
 * The children are laid out and legible from first paint — only the opacity and
 * the 18px offset are deferred — so a browser without IntersectionObserver, or
 * a script that never runs, leaves readable prose rather than an empty column.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  as?: ElementType
  className?: string
  once?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          if (once) io.disconnect()
        } else if (!once) {
          setShown(false)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/**
 * Counts up to a figure once it is on screen.
 *
 * The final value is rendered on the server and is what a reader without
 * JavaScript sees; the count only ever replaces a number that was already
 * correct, so the figure is never wrong mid-animation in a way that matters.
 */
export function Counter({
  to,
  duration = 1100,
  className = '',
}: {
  to: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(to)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced() || typeof IntersectionObserver === 'undefined') return

    setValue(0)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        io.disconnect()
        const t0 = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration)
          // Ease out: the number decelerates into its resting value.
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}

/** A hairline of chalk across the top of the page, tracking read progress. */
export function ScrollProgress() {
  const [p, setP] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
      <div
        className="h-full origin-left bg-chalk/70"
        style={{ transform: `scaleX(${p})`, transition: 'transform 90ms linear' }}
      />
    </div>
  )
}
