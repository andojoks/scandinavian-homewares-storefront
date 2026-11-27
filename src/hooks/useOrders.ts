import { useEffect, useState } from 'react'
import type { Order } from '../data/generate'
import { getBackend } from '../services/backend'

export interface UseOrdersResult {
  orders: Order[]
  loading: boolean
  error: (Error & { code?: string }) | null
}

export function useOrders({
  uid,
  enabled = true,
}: {
  uid?: string
  enabled?: boolean
} = {}): UseOrdersResult {
  const [state, setState] = useState<UseOrdersResult>({
    orders: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!enabled) return
    let unsub = () => {}
    let active = true

    getBackend().then((backend) => {
      if (active) {
        unsub = backend.subscribeOrders(
          { uid },
          (orders) => setState({ orders, loading: false, error: null }),
          (error) => setState((prev) => ({ ...prev, loading: false, error })),
        )
      }
    })

    return () => {
      active = false
      unsub()
    }
  }, [uid, enabled])

  return state
}
