import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

type MotionTag = 'div' | 'p' | 'section' | 'span' | 'article' | 'li'

export function Reveal({
  as = 'div',
  delay = 0,
  y = 28,
  className,
  children,
  ...rest
}: {
  as?: MotionTag
  delay?: number
  y?: number
  className?: string
  children?: ReactNode
} & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const Component = motion[as] as typeof motion.div
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Component>
  )
}
