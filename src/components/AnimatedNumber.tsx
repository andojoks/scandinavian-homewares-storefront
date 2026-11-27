import { animate, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'

export function AnimatedNumber({
  value,
  format = (v: number) => Math.round(v).toLocaleString('en-US'),
  duration = 1.4,
  className,
}: {
  value: number
  format?: (v: number) => string
  duration?: number
  className?: string
}) {
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const prevRef = useRef(0)
  const inView = useInView(spanRef, { once: true })

  useEffect(() => {
    if (!inView || !spanRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spanRef.current.textContent = format(value)
      prevRef.current = value
      return
    }
    const controls = animate(prevRef.current, value, {
      duration: prevRef.current === 0 ? duration : 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (spanRef.current) {
          spanRef.current.textContent = format(latest)
        }
      },
    })
    prevRef.current = value
    return () => controls.stop()
  }, [value, inView, duration, format])

  return (
    <span ref={spanRef} className={`tabular ${className ?? ''}`}>
      {format(0)}
    </span>
  )
}
