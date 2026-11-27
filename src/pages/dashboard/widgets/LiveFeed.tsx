import { AnimatePresence, motion } from 'motion/react'
import type { Order } from '../../../data/generate'
import { initials, money, timeAgo } from '../../../lib/format'
import { avatarTint, WidgetCard, WidgetHead } from './WidgetCard'

export function LiveFeed({
  i,
  orders,
  fresh,
  now,
  live,
  className = '',
}: {
  i: number
  orders: Order[]
  fresh: Set<string>
  now: number
  live: boolean
  className?: string
}) {
  const lastHourCount = orders.filter((o) => now - o.createdAt < 3_600_000).length

  return (
    <WidgetCard i={i} className={`flex flex-col ${className}`}>
      <WidgetHead title="Live orders" sub={`${lastHourCount} in the last hour`}>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium ${
            live ? 'bg-ok-soft text-ok' : 'bg-canvas text-ink-soft'
          }`}
        >
          <span className="relative grid size-2 place-items-center">
            {live && <span className="absolute size-2 animate-ping rounded-full bg-ok/70" />}
            <span className={`size-2 rounded-full ${live ? 'bg-ok' : 'bg-ink-faint'}`} />
          </span>
          {live ? 'Live' : 'Paused'}
        </span>
      </WidgetHead>

      <ul className="-mx-2 mt-4 flex-1 space-y-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {orders.slice(0, 9).map((order, idx) => (
            <motion.li
              key={order.id}
              layout
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 30,
                opacity: { duration: 0.3 },
                delay: fresh.size ? 0 : 0.3 + idx * 0.04,
              }}
              className="relative isolate flex items-center gap-3 rounded-2xl px-2 py-2"
            >
              <AnimatePresence>
                {fresh.has(order.id) && (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-2xl bg-accent-soft"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.2 } }}
                  />
                )}
              </AnimatePresence>

              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${avatarTint(
                  order.customer,
                )}`}
              >
                {initials(order.customer)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{order.customer}</p>
                <p className="truncate text-[12px] text-ink-soft">
                  {order.city} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-medium tabular">{money(order.total)}</p>
                <p className="text-[11px] text-ink-faint tabular">
                  {timeAgo(order.createdAt, now)}
                </p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </WidgetCard>
  )
}
