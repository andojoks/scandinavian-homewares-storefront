import { LayoutDashboard, LogOut, Package } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { SplitHeading } from '../components/SplitHeading'
import { btnPrimary, btnSecondary, eyebrow } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { TINT_BG } from '../data/catalog'
import { useCatalog } from '../data/catalogStore'
import type { OrderStatus } from '../data/generate'
import { useOrders } from '../hooks/useOrders'
import { formatDate, initials, money } from '../lib/format'
import { ORDER_STATUSES } from '../services/backend'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const STATUS_LABELS: Record<OrderStatus, string> = {
  paid: 'Confirmed',
  packing: 'Packing',
  shipped: 'On its way',
  delivered: 'Delivered',
}

export default function Account() {
  const { user, isAdmin, signOut, mode } = useAuth()
  const { orders, loading } = useOrders({ uid: user?.uid, enabled: Boolean(user?.uid) })
  const { byId } = useCatalog()

  if (!user) return null
  const firstName = user.name?.split(' ')[0] || 'there'

  return (
    <section className="px-3 pt-24 pb-12 sm:px-5 sm:pt-28 sm:pb-24">
      <title>Your account — KVIST</title>
      <div className="mx-auto grid gap-3 sm:gap-4 lg:grid-cols-12">
        <motion.div
          className="flex flex-col justify-between tile p-5 sm:p-10 lg:col-span-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
        >
          <div>
            <motion.span
              className="grid size-16 place-items-center rounded-full bg-accent font-display text-2xl font-semibold text-white"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}
            >
              {initials(user.name)}
            </motion.span>
            <h1 className="mt-6 display text-5xl">
              <SplitHeading text={`Hi, ${firstName}.`} delay={0.25} />
            </h1>
            <p className="mt-2 text-ink-soft">{user.email}</p>
            {mode === 'demo' && (
              <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-[13px] text-accent">
                Demo mode: every account can open the dashboard.
              </p>
            )}
          </div>

          <div
            className={`mt-6 grid gap-2.5 sm:mt-10 sm:flex sm:flex-wrap ${
              isAdmin ? 'grid-cols-[1.4fr_1fr]' : ''
            }`}
          >
            {isAdmin && (
              <Link to="/dashboard" viewTransition className={`${btnPrimary} px-4 sm:px-6`}>
                <LayoutDashboard className="size-4" /> Open dashboard
              </Link>
            )}
            <button onClick={signOut} className={`${btnSecondary} px-4 sm:px-6`}>
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </motion.div>

        <motion.div
          className="tile p-5 sm:p-10 lg:col-span-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className={eyebrow}>Orders</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                Your orders
              </h2>
            </div>
            <span className="text-[14px] text-ink-soft">{orders.length} total</span>
          </div>

          {!loading && orders.length === 0 && (
            <motion.div
              className="mt-5 rounded-3xl bg-canvas p-8 text-center sm:mt-8 sm:p-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Package className="mx-auto size-8 text-ink-soft" />
              <p className="mt-3 font-medium">No orders yet</p>
              <Link to="/shop" viewTransition className={`${btnPrimary} mt-5`}>
                Start shopping
              </Link>
            </motion.div>
          )}

          <ul className="mt-6 space-y-3">
            {orders.map((order, idx) => {
              const stageIdx = ORDER_STATUSES.indexOf(order.status)
              return (
                <motion.li
                  key={order.id}
                  className="rounded-3xl bg-canvas p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + idx * 0.06,
                    duration: 0.6,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item) => {
                          const prod = byId[item.id]
                          return (
                            <span
                              key={item.id}
                              className={`grid size-12 place-items-center rounded-xl ring-[3px] ring-canvas ${
                                prod ? TINT_BG[prod.tint] : 'bg-stone'
                              }`}
                            >
                              {prod && (
                                <img src={prod.image} alt="" className="size-9 object-contain" />
                              )}
                            </span>
                          )
                        })}
                      </div>

                      <div>
                        <p className="font-medium">{order.number}</p>
                        <p className="text-[13px] text-ink-soft">
                          {formatDate(order.createdAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-xl font-semibold tabular">
                        {money(order.total)}
                      </p>
                      <p className="text-[13px] font-medium text-ok">
                        {STATUS_LABELS[order.status]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-1.5">
                    {ORDER_STATUSES.map((st, sIdx) => (
                      <div key={st}>
                        <div className="h-1.5 overflow-hidden rounded-full bg-line">
                          <motion.div
                            className="h-full origin-left rounded-full bg-ink"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: +(sIdx <= stageIdx) }}
                            transition={{
                              delay: 0.4 + idx * 0.06 + sIdx * 0.12,
                              duration: 0.5,
                              ease: EASE_OUT_EXPO,
                            }}
                          />
                        </div>
                        <p
                          className={`mt-1.5 text-[11px] ${
                            sIdx <= stageIdx ? 'text-ink' : 'text-ink-faint'
                          }`}
                        >
                          {STATUS_LABELS[st]}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
