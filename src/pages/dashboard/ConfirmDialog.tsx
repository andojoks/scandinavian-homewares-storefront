import { motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'

export const fieldInput =
  'h-11 w-full rounded-xl bg-canvas px-3.5 text-[15px] text-ink ring-1 ring-line outline-none transition-[box-shadow,background-color] placeholder:text-ink-faint focus:bg-card focus:ring-2 focus:ring-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger'

export const fieldTextarea = `${fieldInput} h-auto py-2.5 leading-relaxed`

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
  extra,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  tone?: 'default' | 'danger'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
  extra?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (!busy) onCancel()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [busy, onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
    >
      <motion.div
        className="absolute inset-0 bg-ink/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !busy && onCancel()}
      />

      <motion.div
        className="relative w-full max-w-md tile p-6 sm:p-7"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: 12,
          scale: 0.98,
          transition: { duration: 0.15 },
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <h2 id="confirm-title" className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <div id="confirm-body" className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          {children}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={busy}
            className="h-11 rounded-full px-5 text-[14px] font-medium ring-1 ring-line transition-colors hover:bg-canvas disabled:opacity-60"
          >
            Cancel
          </button>
          {extra}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`h-11 rounded-full px-5 text-[14px] font-medium text-canvas transition-[background-color,transform] active:scale-[0.97] disabled:opacity-60 ${
              tone === 'danger' ? 'bg-danger hover:bg-[#962f1f]' : 'bg-ink hover:bg-[#33312c]'
            }`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
