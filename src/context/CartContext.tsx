import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { useCatalog } from '../data/catalogStore'
import type { Product } from '../data/product'

export interface StoredCartItem {
  id: string
  qty: number
  finish?: string
}

export interface CartLine extends StoredCartItem {
  at: number
  product: Product
}

export interface CartFlight {
  key: string
  src: string
  from: DOMRect
  to: DOMRect
  product: Product
  qty: number
  finish?: string
}

export interface CartToastState {
  message: string
  key: number
}

export interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  shipping: number
  total: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (id: string, qty?: number, finish?: string) => void
  addWithFlight: (
    product: Product,
    sourceEl?: HTMLElement | null,
    opts?: { qty?: number; finish?: string },
  ) => void
  setQty: (lineIndex: number, qty: number) => void
  remove: (lineIndex: number) => void
  clear: () => void
  flights: CartFlight[]
  land: (flight: CartFlight) => void
  toast: CartToastState | null
  showToast: (message: string) => void
  bump: number
  bagRef: MutableRefObject<HTMLButtonElement | null>
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_STORAGE_KEY = 'kvist:cart'

function readInitialCart(): StoredCartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null')
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is StoredCartItem => typeof item?.id === 'string' && item.qty > 0,
        )
      : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { byId, loaded } = useCatalog()
  const [items, setItems] = useState<StoredCartItem[]>(readInitialCart)
  const [open, setOpen] = useState(false)
  const [flights, setFlights] = useState<CartFlight[]>([])
  const [toast, setToast] = useState<CartToastState | null>(null)
  const [bump, setBump] = useState(0)
  const bagRef = useRef<HTMLButtonElement | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (loaded) {
      setItems((prev) => (prev.every((i) => byId[i.id]) ? prev : prev.filter((i) => byId[i.id])))
    }
  }, [byId, loaded])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota errors
    }
  }, [items])

  const add = useCallback((id: string, qty = 1, finish?: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id && item.finish === finish)
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, qty: Math.min(item.qty + qty, 20) } : item,
        )
      }
      return [...prev, { id, qty, finish }]
    })
  }, [])

  const setQtyAt = useCallback((at: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((_, idx) => idx !== at)
        : prev.map((item, idx) => (idx === at ? { ...item, qty: Math.min(qty, 20) } : item)),
    )
  }, [])

  const removeAt = useCallback((at: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== at))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimerRef.current)
    setToast({ message, key: Date.now() })
    toastTimerRef.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const addWithFlight = useCallback(
    (
      product: Product,
      sourceEl?: HTMLElement | null,
      { qty = 1, finish }: { qty?: number; finish?: string } = {},
    ) => {
      const targetEl = bagRef.current
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!sourceEl || !targetEl || reduced) {
        add(product.id, qty, finish)
        setBump((b) => b + 1)
        showToast(`${product.name} added to your bag`)
        return
      }
      const from = sourceEl.getBoundingClientRect()
      const to = targetEl.getBoundingClientRect()
      setFlights((prev) => [
        ...prev,
        {
          key: `${product.id}-${Date.now()}`,
          src: product.image,
          from,
          to,
          product,
          qty,
          finish,
        },
      ])
    },
    [add, showToast],
  )

  const land = useCallback(
    (flight: CartFlight) => {
      setFlights((prev) => prev.filter((f) => f.key !== flight.key))
      add(flight.product.id, flight.qty, flight.finish)
      setBump((b) => b + 1)
      showToast(`${flight.product.name} added to your bag`)
    },
    [add, showToast],
  )

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items
      .map((item, at) => ({ ...item, at, product: byId[item.id] }))
      .filter((item): item is CartLine => Boolean(item.product))
    const count = lines.reduce((sum, l) => sum + l.qty, 0)
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
    const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 12

    return {
      lines,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      open,
      setOpen,
      add,
      addWithFlight,
      setQty: (idx, qty) => {
        if (lines[idx]) setQtyAt(lines[idx].at, qty)
      },
      remove: (idx) => {
        if (lines[idx]) removeAt(lines[idx].at)
      },
      clear,
      flights,
      land,
      toast,
      showToast,
      bump,
      bagRef,
    }
  }, [
    items,
    byId,
    open,
    add,
    addWithFlight,
    setQtyAt,
    removeAt,
    clear,
    flights,
    land,
    toast,
    showToast,
    bump,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
