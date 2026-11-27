import {
  ArrowUpRight,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Store,
  Tags,
  X,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { Link, NavLink, Outlet, useLocation, useOutletContext } from 'react-router'
import { BrandMark } from '../../components/BrandMark'
import { useAuth } from '../../context/AuthContext'
import { useAdminCatalog, type ProductsSnapshot } from '../../data/catalogStore'
import type { Order, OrderStatus } from '../../data/generate'
import { useNow } from '../../hooks/useNow'
import { useOrders } from '../../hooks/useOrders'
import { useSimulation } from '../../hooks/useSimulation'
import { initials } from '../../lib/format'
import { getBackend, HAS_FIREBASE } from '../../services/backend'
import { LiveToggle } from './widgets/LiveToggle'
import { OrderNotifications, type OrderNote } from './widgets/OrderNotifications'

export type DashboardOrder = Order & { simulated?: boolean }

export interface DashboardContextValue {
  orders: DashboardOrder[]
  fresh: Set<string>
  live: boolean
  setLive: Dispatch<SetStateAction<boolean>>
  now: number
  updateStatus: (order: DashboardOrder, status: OrderStatus) => Promise<void>
  error: (Error & { code?: string }) | null
  catalog: ProductsSnapshot
}

export function useDashboardContext(): DashboardContextValue {
  return useOutletContext<DashboardContextValue>()
}

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/orders', label: 'Orders', icon: ReceiptText },
  { to: '/dashboard/products', label: 'Products', icon: Package },
  { to: '/dashboard/categories', label: 'Categories', icon: Tags },
]

export default function DashboardLayout() {
  const { user, signOut, mode } = useAuth()
  const { orders: storedOrders, error } = useOrders()
  const catalog = useAdminCatalog()

  const activeProducts = useMemo(
    () => catalog.products.filter((p) => p.status === 'active'),
    [catalog.products],
  )

  const [live, setLive] = useState(!HAS_FIREBASE)
  const simOrders = useSimulation(live, activeProducts)
  const [simStatusOverrides, setSimStatusOverrides] = useState<Record<string, OrderStatus>>({})
  const [fresh, setFresh] = useState<Set<string>>(() => new Set())
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const seenIdsRef = useRef<Set<string> | null>(null)

  const now = useNow(1000)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const mergedOrders: DashboardOrder[] = useMemo(
    () =>
      [
        ...simOrders.map((o) => ({
          ...o,
          simulated: true,
          status: simStatusOverrides[o.id] ?? o.status,
        })),
        ...storedOrders,
      ].sort((a, b) => b.createdAt - a.createdAt),
    [simOrders, storedOrders, simStatusOverrides],
  )

  useEffect(() => {
    if (!mergedOrders.length) return
    if (!seenIdsRef.current) {
      seenIdsRef.current = new Set(mergedOrders.map((o) => o.id))
      return
    }
    const incoming = mergedOrders.filter((o) => !seenIdsRef.current!.has(o.id))
    if (!incoming.length) return

    incoming.forEach((o) => seenIdsRef.current!.add(o.id))
    const newIds = incoming.map((o) => o.id)

    setFresh((prev) => new Set([...prev, ...newIds]))
    setNotes((prev) =>
      [...incoming.map((order) => ({ key: order.id, order })), ...prev].slice(0, 3),
    )

    setTimeout(() => {
      setFresh((prev) => {
        const next = new Set(prev)
        newIds.forEach((id) => next.delete(id))
        return next
      })
      setNotes((prev) => prev.filter((n) => !newIds.includes(n.key)))
    }, 4200)
  }, [mergedOrders])

  const updateStatus = useCallback(async (order: DashboardOrder, status: OrderStatus) => {
    if (order.simulated) {
      setSimStatusOverrides((prev) => ({ ...prev, [order.id]: status }))
      return
    }
    const backend = await getBackend()
    await backend.updateOrderStatus(order.id, status)
  }, [])

  const contextValue: DashboardContextValue = {
    orders: mergedOrders,
    fresh,
    live,
    setLive,
    now,
    updateStatus,
    error,
    catalog,
  }

  const renderSidebar = (variant: 'rail' | 'sheet') => (
    <>
      <div
        className={`flex items-center justify-between px-2 ${variant === 'sheet' ? 'pr-12' : ''}`}
      >
        <Link to="/" viewTransition aria-label="KVIST storefront">
          <BrandMark />
        </Link>
        <span className="rounded-full bg-canvas px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] text-ink-soft uppercase">
          {mode === 'firebase' ? 'Firebase' : 'Demo'}
        </span>
      </div>

      <LayoutGroup id={`dash-nav-${variant}`}>
        <nav aria-label="Dashboard" className="mt-8 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              viewTransition
              className="relative block"
            >
              {({ isActive }) => (
                <span
                  className={`relative isolate flex h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-medium transition-colors ${
                    isActive ? 'text-canvas' : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dash-active"
                      className="absolute inset-0 -z-10 rounded-2xl bg-ink"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <item.icon className="size-[18px]" />
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}

          <Link
            to="/"
            viewTransition
            className="group flex h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            <Store className="size-[18px]" /> Storefront
            <ArrowUpRight className="ml-auto size-4 opacity-0 transition-all group-hover:opacity-100" />
          </Link>
        </nav>
      </LayoutGroup>

      <div className="mt-auto space-y-3">
        <LiveToggle live={live} setLive={setLive} />

        {user && (
          <div className="flex items-center gap-3 rounded-2xl bg-canvas p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-semibold text-white">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{user.name}</p>
              <p className="truncate text-[12px] text-ink-soft">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-card hover:text-ink"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-dvh bg-canvas lg:pl-[17rem]">
      <title>Dashboard — KVIST</title>

      <motion.aside
        className="fixed inset-y-3 left-3 z-30 hidden w-64 flex-col tile p-4 lg:flex"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {renderSidebar('rail')}
      </motion.aside>

      <div className="sticky top-0 z-30 flex items-center justify-between bg-canvas/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur-lg lg:hidden">
        <BrandMark />
        <button
          onClick={() => setMobileOpen(true)}
          className="grid size-11 place-items-center rounded-full bg-card shadow-tile"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <motion.div
              className="absolute inset-0 bg-ink/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-2 left-2 flex w-[min(300px,85vw)] flex-col tile p-4"
              initial={{ x: '-110%' }}
              animate={{ x: 0 }}
              exit={{ x: '-110%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-canvas"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
              {renderSidebar('sheet')}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 lg:py-3 lg:pr-3 lg:pl-0">
        <Outlet context={contextValue} />
      </main>

      <OrderNotifications notes={notes} now={now} />
    </div>
  )
}
