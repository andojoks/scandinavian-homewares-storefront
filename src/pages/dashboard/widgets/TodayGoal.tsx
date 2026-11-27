import { motion } from 'motion/react'
import { AnimatedNumber } from '../../../components/AnimatedNumber'
import { money } from '../../../lib/format'
import type { TodayStats } from '../../../lib/metrics'
import { WidgetCard, WidgetHead } from './WidgetCard'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TodayGoal({
  i,
  today,
  goal,
  now,
  className = '',
}: {
  i: number
  today: TodayStats
  goal: number
  now: number
  className?: string
}) {
  const ratio = Math.min(1, today.revenue / goal)
  const currentHour = new Date(now).getHours()
  const maxHourOrders = Math.max(...today.hours, 1)

  return (
    <WidgetCard i={i} className={`flex flex-col ${className}`}>
      <WidgetHead title="Today" sub={`Goal ${money(goal)}`} />

      <div className="mt-3 flex flex-1 items-center gap-5">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden>
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke="var(--color-canvas)"
              strokeWidth="12"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - ratio) }}
              transition={{ type: 'spring', stiffness: 40, damping: 16, delay: 0.4 }}
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-2xl leading-none font-semibold tracking-tight">
                <AnimatedNumber value={today.revenue} format={money} />
              </p>
              <p className="mt-1 text-[12px] text-ink-soft">{Math.round(ratio * 100)}% of goal</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-4xl font-semibold tracking-tight">
            <AnimatedNumber value={today.orders} />
          </p>
          <p className="text-[13px] text-ink-soft">orders so far</p>

          <div className="mt-4 flex h-14 items-end gap-[3px]" aria-label="Orders by hour today">
            {today.hours.map((count, hour) => (
              <motion.span
                key={hour}
                className={`flex-1 origin-bottom rounded-t-[3px] ${
                  hour === currentHour ? 'bg-ink' : hour < currentHour ? 'bg-ink/25' : 'bg-line'
                }`}
                style={{ height: '100%' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: Math.max(0.06, count / maxHourOrders) }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 18,
                  delay: 0.3 + hour * 0.02,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
