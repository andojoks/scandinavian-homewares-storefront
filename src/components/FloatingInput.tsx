import { motion } from 'motion/react'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  trailing?: ReactNode
}

export function FloatingInput({ label, trailing, ...inputProps }: FloatingInputProps) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const lifted = focused || Boolean(inputProps.value)

  return (
    <div
      className={`relative rounded-2xl bg-canvas ring-1 transition-[box-shadow,background-color] duration-300 ${
        focused ? 'bg-card ring-2 ring-ink' : 'ring-line'
      }`}
    >
      <motion.label
        htmlFor={id}
        className="pointer-events-none absolute top-0 left-4 origin-left text-ink-soft"
        initial={false}
        animate={lifted ? { y: 8, scale: 0.78 } : { y: 17, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        {label}
      </motion.label>
      <div className="flex items-center pr-1.5">
        <input
          id={id}
          {...inputProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-14 w-full bg-transparent px-4 pt-4 text-[15px] text-ink outline-none"
        />
        {trailing}
      </div>
    </div>
  )
}
