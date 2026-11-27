import { ArrowRight, Check, MapPin, X } from 'lucide-react'
import { motion } from 'motion/react'
import { TINT_BG } from '../../data/catalog'
import type { OrderStatus } from '../../data/generate'
import type { Product } from '../../data/product'
import { formatDate, money, timeAgo } from '../../lib/format'
import { ORDER_STATUSES } from '../../services/backend'
import type { DashboardOrder } from './DashboardLayout'

export const ORDER_STATUS_NAMES: Record<OrderStatus, string> = {
  paid: 'Paid',
  packing: 'Packing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'packing',
  packing: 'shipped',
  shipped: 'delivered',
}

export function OrderDrawer({
  order,
  now,
  byId,
  onClose,
  onAdvance,
}: {
  order: DashboardOrder
  now: number
  byId: Record<string, Product | undefined>
  onClose: () => void
  onAdvance: (order: DashboardOrder, nextStatus: OrderStatus) => void
}) {
  const stageIdx = ORDER_STATUSES.indexOf(order.status)
  const nextStatus = NEXT_ORDER_STATUS[order.status]

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${order.number}`}
    >
      <motion.div
        className="absolute inset-0 bg-ink/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.aside
        className="absolute inset-y-2 right-2 flex w-[min(440px,calc(100vw-16px))] flex-col overflow-y-auto overscroll-contain tile p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6"
        data-lenis-prevent
        initial={{ x: '108%' }}
        animate={{ x: 0 }}
        exit={{ x: '108%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
              {order.simulated ? 'Simulated order' : 'Order'}
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {order.number}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              {formatDate(order.createdAt, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              · {timeAgo(order.createdAt, now)}
            </p>
          </div>

          <button
            onClick={onClose}
            autoFocus
            className="grid size-10 place-items-center rounded-full bg-canvas transition-transform hover:rotate-90"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <ol className="mt-6 space-y-0">
          {ORDER_STATUSES.map((st, idx) => (
            <li key={st} className="relative flex items-center gap-3 pb-4 last:pb-0">
              {idx < ORDER_STATUSES.length - 1 && (
                <span className="absolute top-6 left-[11px] h-[calc(100%-16px)] w-0.5 overflow-hidden rounded bg-line">
                  <motion.span
                    className="block h-full w-full origin-top bg-ink"
                    initial={false}
                    animate={{ scaleY: +(idx < stageIdx) }}
                    transition={{ duration: 0.4 }}
                  />
                </span>
              )}

              <motion.span
                className={`relative grid size-6 place-items-center rounded-full ${
                  idx <= stageIdx ? 'bg-ink text-canvas' : 'bg-canvas ring-1 ring-line'
                }`}
                initial={false}
                animate={{ scale: idx === stageIdx ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                {idx <= stageIdx && <Check className="size-3.5" strokeWidth={3} />}
              </motion.span>

              <span className={`text-[14px] ${idx <= stageIdx ? 'font-medium' : 'text-ink-soft'}`}>
                {ORDER_STATUS_NAMES[st]}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl bg-canvas p-4">
          <p className="font-medium">{order.customer}</p>
          <p className="text-[13px] text-ink-soft">{order.email}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-soft">
            <MapPin className="size-3.5" /> {order.address ? `${order.address}, ` : ''}
            {order.city}
          </p>
        </div>

        <ul className="mt-4 space-y-2">
          {order.items.map((item) => {
            const product = byId[item.id]
            return (
              <li key={`${item.id}-${item.finish ?? ''}`} className="flex items-center gap-3">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                    product ? TINT_BG[product.tint] : 'bg-stone'
                  }`}
                >
                  {product && <img src={product.image} alt="" className="size-9 object-contain" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{item.name}</span>
                  <span className="block text-[12px] text-ink-soft">
                    {item.qty} × {money(item.price)}
                    {item.finish ? ` · ${item.finish}` : ''}
                  </span>
                </span>

                <span className="text-[14px] tabular">{money(item.qty * item.price)}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="text-ink-soft">Total</span>
          <span className="font-display text-2xl font-semibold tabular">{money(order.total)}</span>
        </div>

        {nextStatus && (
          <button
            onClick={() => onAdvance(order, nextStatus)}
            className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink font-medium text-canvas transition-transform active:scale-[0.97]"
          >
            Mark as {ORDER_STATUS_NAMES[nextStatus].toLowerCase()} <ArrowRight className="size-4" />
          </button>
        )}
      </motion.aside>
    </div>
  )
}
