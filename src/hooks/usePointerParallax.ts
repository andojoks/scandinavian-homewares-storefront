import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'motion/react'
import { useEffect, type RefObject } from 'react'

export function usePointerParallax(
  ref: RefObject<HTMLElement | null>,
  strength = 16,
): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduced = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.6 })

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !window.matchMedia('(hover: hover)').matches) return

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * strength)
      rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * strength)
    }

    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, strength, reduced, rawX, rawY])

  return { x, y }
}
