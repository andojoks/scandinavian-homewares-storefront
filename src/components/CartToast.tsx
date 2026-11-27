import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '../context/CartContext'

export function CartToast() {
  const { toast, setOpen } = useCart()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[55] flex justify-center px-4 max-lg:[[data-cta]_&]:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"
      aria-live="polite"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            className="pointer-events-auto flex max-w-full min-w-0 items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-2 text-[14px] text-canvas shadow-lift"
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <span className="grid size-8 place-items-center rounded-full bg-ok">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span className="min-w-0 truncate pr-1">{toast.message}</span>
            <button
              onClick={() => setOpen(true)}
              className="h-9 shrink-0 rounded-full bg-canvas px-3.5 text-[13px] font-medium text-ink"
            >
              View bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
