import { AnimatePresence, motion } from 'motion/react'
import type { Order } from '../../../data/generate'
import { initials, money } from '../../../lib/format'

export interface OrderNote {
  key: string
  order: Order
}

export function OrderNotifications({ notes }: { notes: OrderNote[]; now?: number }) {
  return (
    <div
      className="pointer-events-none fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex w-[min(340px,calc(100vw-24px))] flex-col-reverse gap-2 sm:right-5 sm:bottom-5"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {notes.map((note) => (
          <motion.div
            key={note.key}
            layout
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink p-3 pr-4 text-canvas shadow-lift"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas/10 font-display text-[15px] font-semibold">
              {initials(note.order.customer)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-canvas/60">New order · {note.order.city}</p>
              <p className="truncate text-[14px] font-medium">{note.order.customer}</p>
            </div>
            <span className="font-display text-lg font-semibold tabular">
              {money(note.order.total)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
