import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react'
import { useRef } from 'react'

export function Marquee({
  items,
  baseSpeed = 2.2,
  className = '',
}: {
  items: string[]
  baseSpeed?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [-1200, 0, 1200], [-4, 0, 4], {
    clamp: false,
  })
  const directionRef = useRef(1)
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_t, delta) => {
    if (reduced) return
    const vf = velocityFactor.get()
    if (vf < 0) directionRef.current = -1
    else if (vf > 0) directionRef.current = 1
    baseX.set(
      baseX.get() - directionRef.current * (baseSpeed + Math.abs(vf) * baseSpeed) * (delta / 1000),
    )
  })

  const track = (
    <div className="flex shrink-0 items-center">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <span className="px-6 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-semibold tracking-[-0.04em]">
            {item}
          </span>
          <span aria-hidden className="size-3 rounded-full bg-accent" />
        </span>
      ))}
    </div>
  )

  return (
    <div className={`overflow-hidden ${className}`} aria-label={items.join(', ')}>
      <motion.div aria-hidden className="flex w-max whitespace-nowrap" style={{ x }}>
        {track}
        {track}
      </motion.div>
    </div>
  )
}
