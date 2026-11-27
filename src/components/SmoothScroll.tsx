import { ReactLenis, type LenisRef } from 'lenis/react'
import { cancelFrame, frame, useReducedMotion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { RECORD_MODE } from '../lib/record'

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null)
  const skipSmooth = useReducedMotion() || RECORD_MODE

  useEffect(() => {
    if (skipSmooth) return
    const onFrame = ({ timestamp }: { timestamp: number }) => {
      lenisRef.current?.lenis?.raf(timestamp)
    }
    frame.update(onFrame, true)
    return () => cancelFrame(onFrame)
  }, [skipSmooth])

  if (skipSmooth) {
    return <>{children}</>
  }

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.11, wheelMultiplier: 1 }}>
      {children}
    </ReactLenis>
  )
}
