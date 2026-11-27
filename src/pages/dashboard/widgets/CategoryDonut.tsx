import { motion } from 'motion/react'
import { useState } from 'react'
import { arcPath } from '../../../lib/chart'
import { moneyShort } from '../../../lib/format'
import type { CategoryShareEntry } from '../../../lib/metrics'
import { WidgetCard, WidgetHead } from './WidgetCard'

const CATEGORY_COLORS: Record<string, string> = {
  seating: '#2f47d0',
  lighting: '#d9a21b',
  tables: '#1c1b18',
  textiles: '#c46a4a',
  ceramics: '#5e9c76',
  other: '#9a958b',
}

const GAP_ANGLE = 0.05

export function CategoryDonut({
  i,
  data,
  className = '',
}: {
  i: number
  data: CategoryShareEntry[]
  className?: string
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  let cursor = 0
  const arcs = data.map((entry) => {
    const span = entry.share * Math.PI * 2
    const arc = {
      ...entry,
      start: cursor + GAP_ANGLE / 2,
      end: cursor + Math.max(span - GAP_ANGLE / 2, 0.026),
    }
    cursor += span
    return arc
  })

  const active = hoveredId ? data.find((d) => d.id === hoveredId) : null

  return (
    <WidgetCard i={i} className={`flex flex-col ${className}`}>
      <WidgetHead title="Sales by category" sub="Share of revenue in range" />

      <div className="mt-3 flex flex-1 items-center gap-5">
        <div className="relative size-36 shrink-0">
          <svg
            viewBox="0 0 128 128"
            className="size-full"
            role="img"
            aria-label="Revenue share by category"
          >
            {arcs.map((arc, idx) => (
              <motion.path
                key={arc.id}
                d={arcPath(64, 64, 50, arc.start, arc.end)}
                fill="none"
                stroke={CATEGORY_COLORS[arc.id] ?? '#9a958b'}
                strokeWidth={hoveredId === arc.id ? 18 : 14}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: hoveredId && hoveredId !== arc.id ? 0.3 : 1,
                }}
                transition={{
                  pathLength: {
                    duration: 0.9,
                    delay: 0.35 + idx * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.2 },
                }}
                onPointerEnter={() => setHoveredId(arc.id)}
                onPointerLeave={() => setHoveredId(null)}
                style={{ transition: 'stroke-width .25s' }}
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <motion.div
              key={active?.id ?? 'all'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-display text-xl leading-none font-semibold tracking-tight">
                {moneyShort(active ? active.value : total)}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">{active ? active.name : 'All'}</p>
            </motion.div>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1">
          {data.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onPointerEnter={() => setHoveredId(entry.id)}
                onPointerLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(entry.id)}
                onBlur={() => setHoveredId(null)}
                className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2 text-left text-[13px] transition-colors sm:min-h-8 ${
                  hoveredId === entry.id ? 'bg-canvas' : ''
                }`}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.id] ?? '#9a958b' }}
                />
                <span className="flex-1">{entry.name}</span>
                <span className="font-medium tabular">{Math.round(entry.share * 100)}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </WidgetCard>
  )
}
