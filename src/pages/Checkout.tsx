import {
  ArrowRight,
  Banknote,
  Building2,
  LoaderCircle,
  Lock,
  Package,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { btnPrimary, btnSecondary, eyebrow, inputBase } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { TINT_BG } from '../data/catalog'
import { CITIES, type Order } from '../data/generate'
import { money } from '../lib/format'
import { getBackend } from '../services/backend'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface DeliveryOption {
  id: string
  label: string
  note: string
  icon: LucideIcon
  extra: number
}

interface PaymentOption {
  id: string
  label: string
  icon: LucideIcon
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'standard', label: 'Standard', note: '3–5 days', icon: Truck, extra: 0 },
  { id: 'express', label: 'Express', note: 'Next day', icon: Zap, extra: 25 },
]

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'delivery', label: 'Pay on delivery', icon: Banknote },
  { id: 'transfer', label: 'Bank transfer', icon: Building2 },
]

export default function Checkout() {
  const { lines, subtotal, shipping, clear, count } = useCart()
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    address: '',
    city: CITIES[0],
    delivery: 'standard',
    payment: 'delivery',
  })
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({})
  const [status, setStatus] = useState<'idle' | 'placing' | 'done' | 'error'>('idle')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const deliveryExtra = DELIVERY_OPTIONS.find((opt) => opt.id === form.delivery)?.extra ?? 0
  const grandTotal = subtotal + shipping + deliveryExtra

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  if (status === 'done' && placedOrder) {
    return <OrderConfirmation order={placedOrder} />
  }

  if (count === 0) {
    return (
      <section className="grid min-h-[80vh] place-items-center px-6 pt-24">
        <title>Checkout — KVIST</title>
        <motion.div
          className="max-w-md tile p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Package className="mx-auto size-10 text-ink-soft" />
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Your bag is empty
          </h1>
          <p className="mt-2 text-ink-soft">Add a piece or two, then come back here.</p>
          <Link to="/shop" viewTransition className={`${btnPrimary} mt-6`}>
            Browse the shop
          </Link>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="px-3 pt-24 pb-12 sm:px-5 sm:pt-28 sm:pb-24">
      <title>Checkout — KVIST</title>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const nextErrors: { name?: string; address?: string } = {}
          if (!form.name.trim()) nextErrors.name = 'Who should we deliver to?'
          if (form.address.trim().length < 5) {
            nextErrors.address = 'Add a street address and number.'
          }
          setErrors(nextErrors)
          if (Object.keys(nextErrors).length || !user) return

          setStatus('placing')
          try {
            const backend = await getBackend()
            const orderItems = lines.map((line) => ({
              id: line.id,
              name: line.product.name,
              price: line.product.price,
              qty: line.qty,
              finish: line.finish ?? null,
            }))
            const created = await backend.placeOrder({
              user,
              items: orderItems,
              total: grandTotal,
              shipping: form,
            })
            setPlacedOrder(created)
            setStatus('done')
            clear()
          } catch (err) {
            console.error(err)
            setStatus('error')
          }
        }}
        noValidate
        className="mx-auto grid gap-3 sm:gap-4 lg:grid-cols-12"
      >
        <motion.div
          className="tile p-5 sm:p-10 lg:col-span-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
        >
          <p className={eyebrow}>Checkout</p>
          <h1 className="mt-3 display text-[clamp(2.6rem,4.6vw,4.25rem)]">Almost yours.</h1>

          <CheckoutStep n={1} title="Delivery address">
            <div className="grid gap-3 sm:grid-cols-2">
              <LabeledField
                label="Full name"
                value={form.name}
                onChange={(v) => updateField('name', v)}
                error={errors.name}
                autoComplete="name"
              />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium">City</span>
                <select
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={`${inputBase} appearance-none`}
                >
                  {CITIES.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <LabeledField
                  label="Street address"
                  value={form.address}
                  onChange={(v) => updateField('address', v)}
                  error={errors.address}
                  autoComplete="street-address"
                />
              </div>
            </div>
          </CheckoutStep>

          <CheckoutStep n={2} title="Delivery speed">
            <RadioCards
              name="delivery"
              options={DELIVERY_OPTIONS}
              value={form.delivery}
              onChange={(v) => updateField('delivery', v)}
              render={(opt) => (
                <>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-[13px] text-ink-soft">
                    {opt.note} · {opt.extra ? `+${money(opt.extra)}` : 'Included'}
                  </span>
                </>
              )}
            />
          </CheckoutStep>

          <CheckoutStep n={3} title="Payment">
            <RadioCards
              name="payment"
              options={PAYMENT_OPTIONS}
              value={form.payment}
              onChange={(v) => updateField('payment', v)}
              render={(opt) => <span className="font-medium">{opt.label}</span>}
            />
          </CheckoutStep>
        </motion.div>

        <motion.aside
          className="h-fit tile p-5 sm:p-8 lg:sticky lg:top-24 lg:col-span-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT_EXPO }}
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight">Order summary</h2>
          <ul className="mt-5 space-y-3">
            {lines.map((line, idx) => (
              <motion.li
                key={`${line.id}-${line.finish}`}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.06 }}
              >
                <span
                  className={`relative grid size-16 shrink-0 place-items-center rounded-xl ${TINT_BG[line.product.tint]}`}
                >
                  <img src={line.product.image} alt="" className="size-12 object-contain" />
                  <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-semibold text-canvas">
                    {line.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">
                    {line.product.name}
                  </span>
                  {line.finish && (
                    <span className="block text-[13px] text-ink-soft">{line.finish}</span>
                  )}
                </span>
                <span className="text-[15px] tabular">{money(line.product.price * line.qty)}</span>
              </motion.li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[15px]">
            <SummaryRow label="Subtotal" value={money(subtotal)} />
            <SummaryRow label="Shipping" value={shipping ? money(shipping) : 'Free'} />
            <AnimatePresence initial={false}>
              {deliveryExtra > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <SummaryRow label="Express" value={money(deliveryExtra)} />
                </motion.div>
              )}
            </AnimatePresence>
          </dl>

          <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
            <span className="text-ink-soft">Total</span>
            <AnimatedNumber
              value={grandTotal}
              format={money}
              className="font-display text-4xl font-semibold tracking-tight"
            />
          </div>

          <AnimatePresence>
            {status === 'error' && (
              <motion.p
                role="alert"
                className="mt-4 rounded-2xl bg-[#f8e3df] px-4 py-3 text-[14px] text-danger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                We couldn’t place the order. Check your connection and try again.
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={status === 'placing'}
            className={`${btnPrimary} group mt-6 h-14 w-full text-[16px]`}
          >
            {status === 'placing' ? (
              <>
                <LoaderCircle className="size-5 animate-spin" /> Placing order…
              </>
            ) : (
              <>
                Place order{' '}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-faint">
            <Lock className="size-3" /> No card details are collected in this demo.
          </p>
        </motion.aside>
      </form>
    </section>
  )
}

function CheckoutStep({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 sm:mt-10">
      <legend className="mb-4 flex items-center gap-3 text-[17px] font-medium">
        <span className="grid size-7 place-items-center rounded-full bg-ink text-[13px] text-canvas">
          {n}
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function LabeledField({
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete']
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <motion.input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={`${inputBase} ${error ? 'ring-2 ring-danger/70' : ''}`}
        animate={error ? { x: [0, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      />
      <AnimatePresence>
        {error && (
          <motion.span
            className="mt-1.5 block text-[13px] text-danger"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}

function RadioCards<T extends { id: string; icon: LucideIcon }>({
  name,
  options,
  value,
  onChange,
  render,
}: {
  name: string
  options: T[]
  value: string
  onChange: (id: string) => void
  render: (opt: T) => ReactNode
}) {
  return (
    <LayoutGroup id={name}>
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.id)}
              className="relative flex items-center gap-3 rounded-2xl bg-canvas p-4 text-left ring-1 ring-line"
            >
              {selected && (
                <motion.span
                  layoutId={`${name}-sel`}
                  className="absolute inset-0 rounded-2xl bg-card ring-2 ring-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={`relative grid size-10 place-items-center rounded-xl transition-colors ${
                  selected ? 'bg-ink text-canvas' : 'bg-card'
                }`}
              >
                <opt.icon className="size-[18px]" />
              </span>
              <span className="relative flex flex-col">{render(opt)}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  )
}

function OrderConfirmation({ order }: { order: Order }) {
  const { isAdmin } = useAuth()
  const confetti = Array.from({ length: 18 })
  const confettiColors = ['bg-accent', 'bg-sage', 'bg-butter', 'bg-blush', 'bg-ink', 'bg-sky']

  return (
    <section className="grid min-h-svh place-items-center px-3 py-24 sm:px-5">
      <title>Order placed — KVIST</title>
      <motion.div
        className="relative w-full max-w-lg overflow-hidden tile p-8 text-center sm:p-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <div className="relative mx-auto size-24">
          {confetti.map((_, idx) => {
            const angle = (idx / confetti.length) * Math.PI * 2
            const radius = 90 + (idx % 3) * 30
            return (
              <motion.span
                key={idx}
                aria-hidden
                className={`absolute top-1/2 left-1/2 size-2.5 rounded-[3px] ${
                  confettiColors[idx % confettiColors.length]
                }`}
                initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0 }}
                animate={{
                  x: `calc(-50% + ${Math.cos(angle) * radius}px)`,
                  y: `calc(-50% + ${Math.sin(angle) * radius}px)`,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.6],
                  rotate: 200,
                }}
                transition={{ delay: 0.55, duration: 1.1, ease: 'easeOut' }}
              />
            )
          })}

          <motion.svg
            viewBox="0 0 96 96"
            className="relative size-24"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
          >
            <circle cx="48" cy="48" r="46" className="fill-ok" />
            <motion.path
              d="M28 49 L42 63 L69 34"
              fill="none"
              stroke="white"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
            />
          </motion.svg>
        </div>

        <motion.p
          className={`${eyebrow} mt-8`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Order {order.number}
        </motion.p>

        <motion.h1
          className="mt-3 display text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          Thank you!
        </motion.h1>

        <motion.p
          className="mt-3 text-ink-soft"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
        >
          {money(order.total)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'} heading to{' '}
          {order.city}. We’ll email you when it ships.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Link to="/account" viewTransition className={btnPrimary}>
            Track your order
          </Link>
          {isAdmin ? (
            <Link to="/dashboard" viewTransition className={btnSecondary}>
              See it in the dashboard
            </Link>
          ) : (
            <Link to="/shop" viewTransition className={btnSecondary}>
              Keep browsing
            </Link>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
