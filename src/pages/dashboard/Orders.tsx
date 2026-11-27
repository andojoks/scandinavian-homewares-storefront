import { ArrowRight, Check, Search } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { RollingNumber } from '../../components/RollingNumber'
import { SplitHeading } from '../../components/SplitHeading'
import type { OrderStatus } from '../../data/generate'
import { initials, money, timeAgo } from '../../lib/format'
import { ORDER_STATUSES } from '../../services/backend'
import { useDashboardContext } from './DashboardLayout'
import { NEXT_ORDER_STATUS, ORDER_STATUS_NAMES, OrderDrawer } from './OrderDrawer'
import { ORDER_STATUS_PILL } from './widgets/WidgetCard'

const MAX_ROWS = 40
type FilterStatus = 'all' | OrderStatus

export default function Orders() {
  const { orders, fresh, now, updateStatus, catalog } = useDashboardContext()
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [query, setQuery] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map: Record<FilterStatus, number> = {
      all: orders.length,
      paid: 0,
      packing: 0,
      shipped: 0,
      delivered: 0,
    }
    for (const order of orders) {
      map[order.status] += 1
    }
    return map
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders
      .filter((o) => statusFilter === 'all' || o.status === statusFilter)
      .filter(
        (o) => !q || `${o.number} ${o.customer} ${o.city} ${o.email}`.toLowerCase().includes(q),
      )
      .slice(0, MAX_ROWS)
  }, [orders, statusFilter, query])

  const activeOrder = orders.find((o) => o.id === selectedOrderId)

  useEffect(() => {
    if (!selectedOrderId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOrderId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedOrderId])

  return (
    <div className="space-y-3 sm:space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 px-1 pt-2 pb-1 lg:pt-3">
        <div>
          <p className="text-[14px] text-ink-soft">
            <RollingNumber value={counts.all} /> orders · {counts.paid} waiting to pack
          </p>
          <h1 className="mt-1 display text-[clamp(2.2rem,3.6vw,3.25rem)]">
            <SplitHeading text="Orders" />
          </h1>
        </div>

        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order, customer or city"
            className="h-11 w-full rounded-full bg-card pr-4 pl-10 text-[14px] shadow-tile ring-ink transition-shadow outline-none focus:ring-2"
          />
        </label>
      </header>

      <LayoutGroup id="status-filter">
        <div
          role="tablist"
          aria-label="Filter by status"
          className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-1"
        >
          {(['all', ...ORDER_STATUSES] as FilterStatus[]).map((st) => (
            <button
              key={st}
              role="tab"
              aria-selected={statusFilter === st}
              onClick={() => setStatusFilter(st)}
              className={`relative isolate flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors ${
                statusFilter === st ? 'text-canvas' : 'bg-card text-ink-soft hover:text-ink'
              }`}
            >
              {statusFilter === st && (
                <motion.span
                  layoutId="status-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {st === 'all' ? 'All' : ORDER_STATUS_NAMES[st]}
              <span
                className={`rounded-full px-1.5 text-[12px] tabular ${
                  statusFilter === st ? 'bg-canvas/15' : 'bg-canvas'
                }`}
              >
                <RollingNumber value={counts[st]} />
              </span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.div
        className="overflow-hidden tile"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hidden grid-cols-[1.1fr_1.6fr_1fr_0.8fr_0.9fr_1fr] gap-4 border-b border-line px-6 py-3.5 font-mono text-[11px] tracking-[0.12em] text-ink-soft uppercase md:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Placed</span>
          <span className="text-right">Total</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        <ul>
          <AnimatePresence initial={false}>
            {filtered.map((order, idx) => {
              const nextStatus = NEXT_ORDER_STATUS[order.status]
              return (
                <motion.li
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{
                    type: 'spring',
                    stiffness: 340,
                    damping: 32,
                    opacity: { delay: fresh.size ? 0 : Math.min(idx, 12) * 0.025 },
                  }}
                  className="relative border-b border-line/70 last:border-0"
                >
                  <AnimatePresence>
                    {fresh.has(order.id) && (
                      <motion.span
                        className="absolute inset-0 -z-0 bg-accent-soft"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1.2 } }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 sm:px-6 md:grid-cols-[1.1fr_1.6fr_1fr_0.8fr_0.9fr_1fr]">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="col-start-1 row-start-1 -my-2 justify-self-start py-2 text-left font-medium underline-offset-4 hover:underline md:col-start-auto md:row-start-auto"
                    >
                      {order.number}
                    </button>

                    <div className="col-start-1 row-start-2 flex min-w-0 items-center gap-3 md:col-start-auto md:row-start-auto">
                      <span className="hidden size-8 shrink-0 place-items-center rounded-full bg-canvas text-[11px] font-semibold sm:grid">
                        {initials(order.customer)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px]">{order.customer}</span>
                        <span className="block truncate text-[12px] text-ink-soft">
                          {order.city}
                        </span>
                      </span>
                    </div>

                    <span className="hidden text-[13px] text-ink-soft tabular md:block">
                      {timeAgo(order.createdAt, now)}
                    </span>

                    <span className="col-start-2 row-start-1 text-right font-medium tabular md:col-start-auto md:row-start-auto">
                      {money(order.total)}
                    </span>

                    <span className="col-start-2 row-start-2 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-start">
                      <OrderStatusBadge status={order.status} />
                    </span>

                    <span className="col-span-2 row-start-3 mt-1 justify-self-end md:col-span-1 md:row-start-auto md:mt-0">
                      {nextStatus ? (
                        <motion.button
                          onClick={() => void updateStatus(order, nextStatus)}
                          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-canvas px-3.5 text-[13px] font-medium ring-1 ring-line transition-colors hover:bg-ink hover:text-canvas md:h-8 md:px-3 md:text-[12px]"
                          whileTap={{ scale: 0.94 }}
                        >
                          Mark {ORDER_STATUS_NAMES[nextStatus].toLowerCase()}{' '}
                          <ArrowRight className="size-3" />
                        </motion.button>
                      ) : (
                        <span className="inline-flex h-8 items-center gap-1 text-[12px] text-ok">
                          <Check className="size-3.5" /> Complete
                        </span>
                      )}
                    </span>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {filtered.length === 0 && (
          <p className="p-12 text-center text-ink-soft">No orders match.</p>
        )}
      </motion.div>

      <AnimatePresence>
        {activeOrder && (
          <OrderDrawer
            order={activeOrder}
            now={now}
            byId={catalog.byId}
            onClose={() => setSelectedOrderId(null)}
            onAdvance={(o, s) => void updateStatus(o, s)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${ORDER_STATUS_PILL[status]}`}
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        {ORDER_STATUS_NAMES[status]}
      </motion.span>
    </AnimatePresence>
  )
}
