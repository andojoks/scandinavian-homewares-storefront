import { Check, TriangleAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

export type ToastTone = 'ok' | 'error'

export interface DashToastLink {
  to: string
  label: string
}

export interface DashToastItem {
  key: number
  message: string
  tone: ToastTone
  link?: DashToastLink
}

export function useDashToast() {
  const [toast, setToast] = useState<DashToastItem | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const notify = useCallback((message: string, tone: ToastTone = 'ok', link?: DashToastLink) => {
    clearTimeout(timerRef.current)
    setToast({ key: Date.now(), message, tone, link })
    timerRef.current = setTimeout(() => setToast(null), tone === 'error' ? 6000 : 3200)
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { toast, notify, dismiss }
}

export function DashToast({
  toast,
  onClose,
}: {
  toast: DashToastItem | null
  onClose: () => void
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[65] flex justify-center px-4 lg:pl-[17rem]"
      aria-live="polite"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-full min-w-0 items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-2 text-[14px] text-canvas shadow-lift"
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full ${
                toast.tone === 'error' ? 'bg-danger' : 'bg-ok'
              }`}
            >
              {toast.tone === 'error' ? (
                <TriangleAlert className="size-4" />
              ) : (
                <Check className="size-4" strokeWidth={3} />
              )}
            </span>

            <span className="min-w-0 pr-1 [overflow-wrap:anywhere]">{toast.message}</span>

            {toast.link ? (
              <Link
                to={toast.link.to}
                viewTransition
                className="h-9 shrink-0 content-center rounded-full bg-canvas px-3.5 text-[13px] font-medium text-ink"
              >
                {toast.link.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-9 shrink-0 rounded-full px-3 text-[13px] font-medium text-canvas/70 hover:text-canvas"
              >
                Dismiss
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
