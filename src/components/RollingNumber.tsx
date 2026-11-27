import { AnimatePresence, motion } from 'motion/react'

export function RollingNumber({
  value,
  className = '',
}: {
  value: number | string
  className?: string
}) {
  return (
    <span className={`relative inline-flex overflow-hidden tabular ${className}`}>
      <AnimatePresence mode="popLayout" initial={false} custom={value}>
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
