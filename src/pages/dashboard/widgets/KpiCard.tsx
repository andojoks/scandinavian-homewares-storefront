import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { AnimatedNumber } from '../../../components/AnimatedNumber'
import { areaPath, smoothPath, type Point } from '../../../lib/chart'
import { pct } from '../../../lib/format'
import { WidgetCard } from './WidgetCard'

const SPARK_WIDTH = 120
const SPARK_HEIGHT = 40

export function KpiCard({
  i,
  label,
  icon: Icon,
  value,
  delta,
  format,
  series,
}: {
  i: number
  label: string
  icon: LucideIcon
  value: number
  delta: number
  format: (v: number) => string
  series: number[]
}) {
  const maxVal = Math.max(...series, 1)
  const points: Point[] = series.map((val, idx) => [
    (idx / Math.max(1, series.length - 1)) * SPARK_WIDTH,
    36 - (val / maxVal) * 32,
  ])
  const positive = delta >= 0
  const gradId = `kpi-grad-${i}`

  return (
    <WidgetCard i={i} className="flex flex-col justify-between !p-4 sm:min-h-[168px] sm:!p-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] leading-tight text-ink-soft sm:text-[14px]">{label}</p>
        <span className="hidden size-9 shrink-0 place-items-center rounded-xl bg-canvas sm:grid">
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 sm:mt-4">
        <div className="min-w-0">
          <p className="font-display text-[1.6rem] leading-none font-semibold tracking-[-0.03em] sm:text-[2.1rem]">
            <AnimatedNumber value={value} format={format} />
          </p>
          <motion.span
            key={positive ? 'up' : 'down'}
            className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${
              positive ? 'bg-ok-soft text-ok' : 'bg-[#f8e3df] text-danger'
            }`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {pct(delta)}
            <span className="sr-only">versus the previous period</span>
          </motion.span>
        </div>

        <svg
          viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
          className="hidden h-10 w-28 shrink-0 overflow-visible sm:block lg:w-24 2xl:w-28"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0"
                stopColor={positive ? 'var(--color-ok)' : 'var(--color-danger)'}
                stopOpacity="0.22"
              />
              <stop
                offset="1"
                stopColor={positive ? 'var(--color-ok)' : 'var(--color-danger)'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath(points, SPARK_HEIGHT)}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0, d: areaPath(points, SPARK_HEIGHT) }}
            animate={{ opacity: 1, d: areaPath(points, SPARK_HEIGHT) }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          <motion.path
            d={smoothPath(points)}
            fill="none"
            stroke={positive ? 'var(--color-ok)' : 'var(--color-danger)'}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, d: smoothPath(points) }}
            animate={{ pathLength: 1, d: smoothPath(points) }}
            transition={{
              pathLength: { duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
              d: { duration: 0.6 },
            }}
          />
        </svg>
      </div>
    </WidgetCard>
  )
}
