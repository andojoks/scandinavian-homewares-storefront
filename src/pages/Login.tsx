import { ArrowRight, Eye, EyeOff, LayoutDashboard, LoaderCircle } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { BrandMark } from '../components/BrandMark'
import { FloatingInput } from '../components/FloatingInput'
import { btnPrimary, btnSecondary, eyebrow } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { TINT_BG, type TintName } from '../data/catalog'
import { imageAsset } from '../lib/asset'
import { friendlyAuthError } from '../services/backend'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const FLOATING_SHOWCASE: { src: string; tint: TintName; dur: number; delay: number }[] = [
  { src: imageAsset('lamp.webp'), tint: 'butter', dur: 6, delay: 0 },
  { src: imageAsset('vase.webp'), tint: 'sky', dur: 7, delay: 0.6 },
  { src: imageAsset('chair.webp'), tint: 'sage', dur: 6.5, delay: 0.3 },
  { src: imageAsset('throw.webp'), tint: 'blush', dur: 7.5, delay: 0.9 },
]

export default function Login() {
  const { user, loading, mode, signIn, signUp, signInWithGoogle, demoSignIn } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const rawNext = searchParams.get('next')
  const nextUrl = rawNext?.startsWith('/') ? rawNext : '/account'

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState<'form' | 'google' | 'demo' | null>(null)
  const [error, setError] = useState('')
  const [shakeCount, setShakeCount] = useState(0)
  const [formScope, animateForm] = useAnimate()

  useEffect(() => {
    setError('')
  }, [tab])

  useEffect(() => {
    if (shakeCount && formScope.current) {
      animateForm(formScope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.45 })
    }
  }, [shakeCount, formScope, animateForm])

  if (!loading && user && !busy) {
    return <Navigate to={nextUrl} replace />
  }

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const runAction = async (kind: 'form' | 'google' | 'demo', action: () => Promise<void>) => {
    setBusy(kind)
    setError('')
    try {
      await action()
      navigate(nextUrl, { replace: true, viewTransition: true })
    } catch (err) {
      setError(friendlyAuthError(err))
      setShakeCount((c) => c + 1)
      setBusy(null)
    }
  }

  return (
    <section className="px-3 pt-24 pb-10 sm:px-5 sm:pt-28">
      <title>{tab === 'signin' ? 'Sign in — KVIST' : 'Create account — KVIST'}</title>
      <div className="mx-auto grid gap-3 sm:gap-4 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-12">
        <motion.div
          className="flex flex-col justify-center tile p-6 sm:p-12 lg:col-span-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
        >
          <div className="mx-auto w-full max-w-[400px]">
            <p className={eyebrow}>{tab === 'signin' ? 'Welcome back' : 'New here'}</p>

            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={tab}
                className="mt-3 display text-[clamp(2.6rem,4vw,3.75rem)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              >
                {tab === 'signin' ? 'Sign in' : 'Create account'}
              </motion.h1>
            </AnimatePresence>

            <LayoutGroup id="auth-tabs">
              <div role="tablist" className="mt-7 grid grid-cols-2 rounded-full bg-canvas p-1">
                {(
                  [
                    ['signin', 'Sign in'],
                    ['signup', 'Create account'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={`relative isolate h-10 rounded-full text-[14px] font-medium transition-colors ${
                      tab === key ? 'text-ink' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {tab === key && (
                      <motion.span
                        layoutId="auth-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-card shadow-tile"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </LayoutGroup>

            <form
              ref={formScope}
              onSubmit={(e) => {
                e.preventDefault()
                if (tab === 'signup' && !form.name.trim()) {
                  setError('Tell us your name so we know who to deliver to.')
                  setShakeCount((c) => c + 1)
                  return
                }
                runAction('form', () =>
                  tab === 'signin' ? signIn(form.email, form.password) : signUp(form),
                )
              }}
              className="mt-6 space-y-3"
              noValidate
            >
              <AnimatePresence initial={false}>
                {tab === 'signup' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FloatingInput
                      label="Full name"
                      autoComplete="name"
                      value={form.name}
                      onChange={setField('name')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <FloatingInput
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={setField('email')}
              />

              <FloatingInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={setField('password')}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="grid size-10 place-items-center rounded-full text-ink-soft hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    role="alert"
                    className="rounded-2xl bg-[#f8e3df] px-4 py-3 text-[14px] text-danger"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={Boolean(busy)}
                className={`${btnPrimary} group h-13 w-full`}
              >
                {busy === 'form' ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <>
                    {tab === 'signin' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[12px] text-ink-faint">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>

            {mode === 'firebase' ? (
              <button
                onClick={() => runAction('google', signInWithGoogle)}
                disabled={Boolean(busy)}
                className={`${btnSecondary} w-full`}
              >
                {busy === 'google' ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <GoogleLogo />
                )}
                Continue with Google
              </button>
            ) : (
              <div>
                <button
                  onClick={() => runAction('demo', demoSignIn)}
                  disabled={Boolean(busy)}
                  className={`${btnSecondary} w-full`}
                >
                  {busy === 'demo' ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <LayoutDashboard className="size-4" />
                  )}
                  Continue as demo admin
                </button>
                <p className="mt-3 text-center text-[12px] text-ink-faint">
                  Demo mode: accounts are stored in this browser. Add Firebase keys to go live.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="relative hidden grid-cols-2 grid-rows-[1fr_1.25fr] gap-3 sm:gap-4 lg:col-span-7 lg:grid">
          {FLOATING_SHOWCASE.map((item, idx) => (
            <motion.div
              key={item.src}
              className={`relative overflow-hidden rounded-[var(--radius-tile)] ${TINT_BG[item.tint]}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15 + idx * 0.1, ease: EASE_OUT_EXPO }}
            >
              <motion.img
                src={item.src}
                alt=""
                className="absolute inset-[14%] size-[72%] object-contain"
                animate={{
                  y: [0, -14, 0],
                  rotate: [0, idx % 2 ? 2 : -2, 0],
                }}
                transition={{
                  duration: item.dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: item.delay,
                }}
              />
            </motion.div>
          ))}

          <motion.div
            className="absolute bottom-6 left-1/2 w-[min(440px,80%)] -translate-x-1/2 rounded-3xl bg-card/85 p-5 shadow-lift backdrop-blur-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9, ease: EASE_OUT_EXPO }}
          >
            <BrandMark className="text-lg" />
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Track orders, save your favourites and check out in seconds.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1c.9-2.8 3.5-4.8 6.6-4.8z"
      />
    </svg>
  )
}
