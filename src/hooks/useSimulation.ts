import { useEffect, useRef, useState } from 'react'
import { makeOrder, mulberry32, type Order } from '../data/generate'
import type { Product } from '../data/product'
import { RECORD_LIVE_DELAY, RECORD_MODE } from '../lib/record'

export function useSimulation(
  active: boolean,
  products: Product[],
  { minGap = 3500, maxGap = 8000 }: { minGap?: number; maxGap?: number } = {},
): Order[] {
  const [simulated, setSimulated] = useState<Order[]>([])
  const poolRef = useRef(products)

  useEffect(() => {
    poolRef.current = products
  }, [products])

  const randRef = useRef(mulberry32(RECORD_MODE ? 1009 : Date.now() | 0))

  useEffect(() => {
    if (!active) return
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      if (poolRef.current.length) {
        setSimulated((prev) =>
          [makeOrder(randRef.current, Date.now(), {}, poolRef.current), ...prev].slice(0, 200),
        )
      }
      const nextDelay = RECORD_MODE ? 60_000 : minGap + randRef.current() * (maxGap - minGap)
      timer = setTimeout(tick, nextDelay)
    }

    timer = setTimeout(tick, RECORD_MODE ? RECORD_LIVE_DELAY : 1800)
    return () => clearTimeout(timer)
  }, [active, minGap, maxGap])

  return simulated
}
