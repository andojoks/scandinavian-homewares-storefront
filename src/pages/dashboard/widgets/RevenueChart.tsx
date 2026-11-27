import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useState, type PointerEvent } from 'react'
import { useSize } from '../../../hooks/useSize'
import { areaPath, niceMax, smoothPath, type Point } from '../../../lib/chart'
import { formatDate, int, money, moneyShort } from '../../../lib/format'
import type { DailySeriesPoint } from '../../../lib/metrics'
import { WidgetCard, WidgetHead } from './WidgetCard'

const PAD = { top: 16, right: 12, bottom: 28, left: 48 }
const METRIC_LABELS = { revenue: 'Revenue', orders: 'Orders' } as const
type MetricKey = keyof typeof METRIC_LABELS

export function RevenueChart({
  i,
  series,
  range,
  live,
  className = '',
}: {
  i: number
  series: DailySeriesPoint[]
  range: number
  live: boolean
  className?: string
}) {
  const [metric, setMetric] = useState<MetricKey>('revenue')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [containerRef, { width, height }] = useSize<HTMLDivElement>()

  const values = series.map((pt) => pt[metric])
  const yMax = niceMax(Math.max(...values, 1) * 1.1)
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = Math.max(0, height - PAD.top - PAD.bottom)

  const xAt = (idx: number) =>
    PAD.left + (series.length === 1 ? plotW / 2 : (idx / (series.length - 1)) * plotW)
  const yAt = (val: number) => PAD.top + plotH - (val / yMax) * plotH

  const points: Point[] = values.map((val, idx) => [xAt(idx), yAt(val)])
  const line = smoothPath(points)
  const area = areaPath(points, PAD.top + plotH)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax)
  const xStep = Math.ceil(series.length / (width < 520 ? 4 : 7))
  const total = values.reduce((sum, v) => sum + v, 0)
  const formatAxis = metric === 'revenue' ? moneyShort : int
  const animKey = `${range}-${metric}-${width > 0}`

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - rect.left - PAD.left
    const idx = Math.round((relX / plotW) * (series.length - 1))
    setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)))
  }

  const hovered = hoverIdx == null ? null : series[hoverIdx]
  const lastPoint = points[points.length - 1]

  return (
    <WidgetCard i={i} className={`flex flex-col ${className}`}>
      <WidgetHead
        title={`${METRIC_LABELS[metric]} · last ${range} days`}
        sub={metric === 'revenue' ? `${money(total)} in total` : `${int(total)} orders in total`}
      >
        <LayoutGroup id="metric">
          <div className="flex rounded-full bg-canvas p-1">
            {(Object.entries(METRIC_LABELS) as [MetricKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                aria-pressed={metric === key}
                className={`relative isolate h-9 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                  metric === key ? 'text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {metric === key && (
                  <motion.span
                    layoutId="metric-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-card shadow-tile"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {label}
              </button>
            ))}
          </div>
        </LayoutGroup>
      </WidgetHead>

      <div ref={containerRef} className="relative mt-4 min-h-[260px] flex-1">
        {width > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0 touch-none select-none"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIdx(null)}
            role="img"
            aria-label={`${METRIC_LABELS[metric]} per day over the last ${range} days, ${
              metric === 'revenue' ? money(total) : int(total)
            } in total`}
          >
            <defs>
              <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.2" />
                <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={yAt(tick)}
                  y2={yAt(tick)}
                  stroke="var(--color-line)"
                  strokeDasharray={tick === 0 ? undefined : '3 5'}
                />
                <text
                  x={PAD.left - 10}
                  y={yAt(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-ink-faint font-mono text-[10px]"
                >
                  {formatAxis(tick)}
                </text>
              </g>
            ))}

            {series.map((pt, idx) =>
              idx % xStep === 0 || idx === series.length - 1 ? (
                <text
                  key={pt.date}
                  x={xAt(idx)}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-ink-faint font-mono text-[10px]"
                >
                  {idx === series.length - 1 ? 'Today' : formatDate(pt.date)}
                </text>
              ) : null,
            )}

            <motion.path
              key={`a-${animKey}`}
              d={area}
              fill="url(#rev-fill)"
              initial={{ opacity: 0, d: area }}
              animate={{ opacity: 1, d: area }}
              transition={{
                opacity: { duration: 0.8, delay: 0.4 },
                d: { duration: 0.6, ease: 'easeOut' },
              }}
            />

            <motion.path
              key={`l-${animKey}`}
              d={line}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, d: line }}
              animate={{ pathLength: 1, d: line }}
              transition={{
                pathLength: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                d: { duration: 0.6, ease: 'easeOut' },
              }}
            />

            {lastPoint && (
              <motion.g
                animate={{ x: lastPoint[0], y: lastPoint[1] }}
                initial={false}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              >
                {live && (
                  <motion.circle
                    r="6"
                    fill="var(--color-accent)"
                    animate={{ scale: [1, 2.6], opacity: [0.35, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <circle
                  r="5"
                  fill="var(--color-card)"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                />
              </motion.g>
            )}

            <AnimatePresence>
              {hovered && hoverIdx != null && (
                <motion.g
                  key="cross"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.line
                    y1={PAD.top}
                    y2={PAD.top + plotH}
                    stroke="var(--color-ink)"
                    strokeOpacity="0.25"
                    initial={false}
                    animate={{ x1: xAt(hoverIdx), x2: xAt(hoverIdx) }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                  <motion.circle
                    r="5"
                    fill="var(--color-ink)"
                    initial={false}
                    animate={{ cx: xAt(hoverIdx), cy: yAt(hovered[metric]) }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        )}

        <AnimatePresence>
          {hovered && hoverIdx != null && (
            <motion.div
              className="pointer-events-none absolute top-0 rounded-2xl bg-ink px-3.5 py-2.5 text-canvas shadow-lift"
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                x: Math.min(Math.max(xAt(hoverIdx) - 70, 0), width - 140),
              }}
              exit={{ opacity: 0 }}
              transition={{
                x: { type: 'spring', stiffness: 500, damping: 40 },
                default: { duration: 0.15 },
              }}
              style={{ width: 140 }}
            >
              <p className="text-[11px] text-canvas/60">
                {formatDate(hovered.date, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="font-display text-lg font-semibold tabular">{money(hovered.revenue)}</p>
              <p className="text-[12px] text-canvas/70">{hovered.orders} orders</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WidgetCard>
  )
}
