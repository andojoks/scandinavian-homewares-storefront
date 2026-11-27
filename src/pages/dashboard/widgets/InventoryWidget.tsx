import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { TINT_BG } from '../../../data/catalog'
import type { StockRow } from '../../../lib/metrics'
import { WidgetCard, WidgetHead } from './WidgetCard'

export function InventoryWidget({
  i,
  items,
  className = '',
}: {
  i: number
  items: StockRow[]
  className?: string
}) {
  const lowCount = items.filter((item) => item.low).length

  return (
    <WidgetCard i={i} className={className}>
      <WidgetHead title="Inventory" sub="Weekly allocation left after 7 days of sales">
        <div className="flex items-center gap-2">
          {lowCount > 0 && (
            <motion.span
              className="rounded-full bg-warn-soft px-3 py-1 text-[12px] font-medium text-warn"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              {lowCount} running low
            </motion.span>
          )}
          <Link
            to="/dashboard/products"
            viewTransition
            className="inline-flex h-8 items-center gap-1 rounded-full bg-canvas px-3 text-[12px] font-medium ring-1 ring-line transition-colors hover:bg-ink hover:text-canvas"
          >
            Manage <ArrowRight className="size-3" />
          </Link>
        </div>
      </WidgetHead>

      <ul className="mt-5 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
        {items.map((row, idx) => (
          <motion.li
            key={row.product.id}
            layout
            className="flex items-center gap-3"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl ${TINT_BG[row.product.tint]}`}
            >
              <img src={row.product.image} alt="" className="size-7 object-contain" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-[13px]">
                <p className="truncate font-medium">{row.product.name}</p>
                <p
                  className={`shrink-0 tabular ${
                    row.low ? 'font-medium text-warn' : 'text-ink-soft'
                  }`}
                >
                  {row.onHand}/{row.product.stock}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                <motion.div
                  className={`h-full origin-left rounded-full ${row.low ? 'bg-warn' : 'bg-ok'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: row.ratio }}
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                    delay: 0.4 + idx * 0.05,
                  }}
                />
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </WidgetCard>
  )
}
