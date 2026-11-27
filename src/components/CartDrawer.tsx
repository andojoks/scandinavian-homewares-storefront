import { useLenis } from 'lenis/react'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useCart } from '../context/CartContext'
import { TINT_BG } from '../data/catalog'
import { money } from '../lib/format'
import { AnimatedNumber } from './AnimatedNumber'
import { btnPrimary } from './ui'

export function CartDrawer() {
  const { open, setOpen, lines, setQty, remove, subtotal, count } = useCart()
  const navigate = useNavigate()
  const lenis = useLenis()
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const awayFromFree = Math.max(0, 150 - subtotal)

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, lenis, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.div
            className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            className="absolute inset-y-2 right-2 flex w-[min(440px,calc(100vw-16px))] flex-col overflow-hidden rounded-[28px] bg-card shadow-lift"
            initial={{ x: '108%' }}
            animate={{ x: 0 }}
            exit={{ x: '108%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          >
            <header className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Your bag <span className="text-ink-faint">({count})</span>
              </h2>
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-full bg-canvas transition-transform hover:rotate-90"
                aria-label="Close bag"
              >
                <X className="size-5" />
              </button>
            </header>

            {lines.length > 0 && (
              <div className="mx-6 mb-3 rounded-2xl bg-canvas p-3.5">
                <p className="text-[13px] text-ink-soft">
                  {awayFromFree > 0 ? (
                    <>
                      Add <strong className="text-ink">{money(awayFromFree)}</strong> for free
                      delivery
                    </>
                  ) : (
                    <strong className="text-ok">Free delivery unlocked</strong>
                  )}
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <motion.div
                    className="h-full origin-left rounded-full bg-ink"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: Math.min(1, subtotal / 150) }}
                    transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                  />
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-6" data-lenis-prevent>
              {lines.length === 0 ? (
                <motion.div
                  className="grid h-full place-items-center pb-16 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div>
                    <motion.div
                      className="mx-auto grid size-20 place-items-center rounded-full bg-canvas"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ShoppingBag className="size-8 text-ink-soft" />
                    </motion.div>
                    <p className="mt-5 font-display text-2xl font-semibold">Your bag is empty</p>
                    <p className="mt-1 text-ink-soft">Good things take a moment to choose.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.ul layout className="space-y-3 pb-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line, index) => (
                      <motion.li
                        key={`${line.id}-${line.finish ?? ''}`}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: {
                            delay: 0.12 + index * 0.05,
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          },
                        }}
                        exit={{
                          opacity: 0,
                          x: 60,
                          transition: { duration: 0.25 },
                        }}
                        className="flex gap-4 rounded-2xl bg-canvas p-3"
                      >
                        <div
                          className={`grid size-24 shrink-0 place-items-center rounded-xl ${TINT_BG[line.product.tint]}`}
                        >
                          <img
                            src={line.product.image}
                            alt=""
                            className="size-20 object-contain"
                            width="80"
                            height="80"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{line.product.name}</p>
                              {line.finish && (
                                <p className="text-[13px] text-ink-soft">{line.finish}</p>
                              )}
                            </div>
                            <button
                              onClick={() => remove(index)}
                              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-card hover:text-danger"
                              aria-label={`Remove ${line.product.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full bg-card ring-1 ring-line">
                              <button
                                onClick={() => setQty(index, line.qty - 1)}
                                className="grid size-9 place-items-center"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium tabular">
                                {line.qty}
                              </span>
                              <button
                                onClick={() => setQty(index, line.qty + 1)}
                                className="grid size-9 place-items-center"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="font-medium tabular">
                              {money(line.product.price * line.qty)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-line p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="mb-4 flex items-end justify-between">
                  <span className="text-ink-soft">Subtotal</span>
                  <AnimatedNumber
                    value={subtotal}
                    format={money}
                    className="font-display text-3xl font-semibold tracking-tight"
                  />
                </div>
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate('/checkout', { viewTransition: true })
                  }}
                  className={`${btnPrimary} group w-full`}
                >
                  Checkout
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
