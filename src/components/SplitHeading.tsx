import { motion } from 'motion/react'
import type { ElementType } from 'react'

export function SplitHeading({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.06,
  inView = false,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  inView?: boolean
}) {
  const words = text.split(' ')
  const triggerProps = inView
    ? {
        whileInView: 'show' as const,
        viewport: { once: true, margin: '0px 0px -10% 0px' },
      }
    : { animate: 'show' as const }

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        initial="hide"
        {...triggerProps}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {words.map((word, index) => (
          <span
            key={index}
            className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
          >
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                hide: { y: '110%', rotate: 4 },
                show: { y: '0%', rotate: 0 },
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
              {index < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
