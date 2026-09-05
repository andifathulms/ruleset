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

/**
 * Lands a fragment link under the sticky chrome rather than behind it.
 *
 * `scroll-margin-top` alone is not enough here. The header condenses once the
 * page scrolls, which both shortens the document and changes the margin, so a
 * smooth scroll is animating toward a position computed from measurements that
 * are no longer true by the time it arrives — links were landing up to 37px
 * under the bars. This waits for the scroll to settle and corrects what is
 * left, and it gives up the moment the reader takes over.
 */
export function HashLanding() {
  useEffect(() => {
    let taken = false
    const surrender = () => {
      taken = true
    }
    const passive = { passive: true } as AddEventListenerOptions
    window.addEventListener('wheel', surrender, passive)
    window.addEventListener('touchstart', surrender, passive)
    window.addEventListener('keydown', surrender)

    const correct = () => {
      if (taken) return
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return

      // Only bars actually pinned to the top of the viewport are in the way.
      let chrome = 0
      document
        .querySelectorAll('header, nav[aria-label="Sections"]')
        .forEach((bar) => {
          const box = bar.getBoundingClientRect()
          if (box.top <= 1) chrome = Math.max(chrome, box.bottom)
        })

      const top = el.getBoundingClientRect().top
      if (top < chrome + 4) window.scrollBy({ top: top - chrome - 20, behavior: 'auto' })
    }

    /* The correction has to wait for the smooth scroll to finish. Firing on a
       fixed delay ran it mid-animation, where the browser simply continued to
       its own stale destination and overrode it, so this waits for scrollY to
       stop moving. `scrollend` would say this directly but is not everywhere
       yet, and two identical samples is the same answer. */
    let poll = 0
    const whenSettled = () => {
      let last = -1
      let still = 0
      let ticks = 0
      window.clearInterval(poll)
      poll = window.setInterval(() => {
        if (taken || ++ticks > 40) {
          window.clearInterval(poll)
          return
        }
        const y = Math.round(window.scrollY)
        still = y === last ? still + 1 : 0
        last = y
        if (still >= 2) {
          window.clearInterval(poll)
          correct()
        }
      }, 100)
    }

    const timers = [setTimeout(whenSettled, 120)]
    const onHashChange = () => {
      taken = false
      timers.push(setTimeout(whenSettled, 120))
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.clearInterval(poll)
      timers.forEach(clearTimeout)
      window.removeEventListener('wheel', surrender)
      window.removeEventListener('touchstart', surrender)
      window.removeEventListener('keydown', surrender)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  return null
}
