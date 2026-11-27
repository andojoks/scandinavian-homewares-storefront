import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import type { OrderStatus } from '../../../data/generate'

export function WidgetCard({
  i = 0,
  className = '',
  children,
  ...rest
}: {
  i?: number
  className?: string
  children: ReactNode
} & Omit<HTMLMotionProps<'section'>, 'children'>) {
  return (
    <motion.section
      className={`relative overflow-hidden tile p-5 sm:p-6 ${className}`}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.1 + i * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...rest}
    >
      {children}
    </motion.section>
  )
}

export function WidgetHead({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-medium">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-ink-soft">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

const AVATAR_TINTS = ['bg-sage', 'bg-butter', 'bg-sky', 'bg-blush', 'bg-sand', 'bg-stone']

export const avatarTint = (name: string): string =>
  AVATAR_TINTS[[...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % AVATAR_TINTS.length]

export const ORDER_STATUS_PILL: Record<OrderStatus, string> = {
  paid: 'bg-accent-soft text-accent ring-1 ring-inset ring-accent/25',
  packing: 'bg-warn-soft text-warn ring-1 ring-inset ring-warn/20',
  shipped: 'bg-sky text-[#2d4b74] ring-1 ring-inset ring-[#2d4b74]/15',
  delivered: 'bg-ok-soft text-ok ring-1 ring-inset ring-ok/20',
}
