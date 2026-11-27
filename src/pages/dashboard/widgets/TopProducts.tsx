import { motion } from 'motion/react'
import { TINT_BG } from '../../../data/catalog'
import { money } from '../../../lib/format'
import type { TopProductEntry } from '../../../lib/metrics'
import { WidgetCard, WidgetHead } from './WidgetCard'

export function TopProducts({
  i,
  items,
  className = '',
}: {
  i: number
  items: TopProductEntry[]
  className?: string
}) {
  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1)

  return (
    <WidgetCard i={i} className={className}>
      <WidgetHead title="Top products" sub="By revenue in range" />

      <ul className="mt-5 space-y-3.5">
        {items.map((entry, idx) => (
          <motion.li
            key={entry.product.id}
            layout
            className="flex items-center gap-3"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <span className="w-4 text-[12px] font-medium text-ink-faint tabular">{idx + 1}</span>
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${TINT_BG[entry.product.tint]}`}
            >
              <img src={entry.product.image} alt="" className="size-8 object-contain" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[14px] font-medium">{entry.product.name}</p>
                <p className="shrink-0 text-[14px] font-medium tabular">{money(entry.revenue)}</p>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    className="h-full origin-left rounded-full bg-accent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: entry.revenue / maxRevenue }}
                    transition={{
                      type: 'spring',
                      stiffness: 80,
                      damping: 18,
                      delay: 0.4 + idx * 0.08,
                    }}
                  />
                </div>
                <span className="w-14 text-right text-[12px] text-ink-soft tabular">
                  {entry.units} sold
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </WidgetCard>
  )
}
