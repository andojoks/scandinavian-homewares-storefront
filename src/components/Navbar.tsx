import { useLenis } from 'lenis/react'
import { LayoutDashboard, Menu, ShoppingBag, User, X } from 'lucide-react'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useAnimate,
  useMotionValueEvent,
  useScroll,
} from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { initials } from '../lib/format'
import { BrandMark } from './BrandMark'
import { RollingNumber } from './RollingNumber'

const NAV_LINKS = [
  { to: '/shop', label: 'Shop all' },
  { to: '/shop?c=seating', label: 'Seating' },
  { to: '/shop?c=lighting', label: 'Lighting' },
  { to: '/shop?c=textiles', label: 'Textiles' },
  { to: '/shop?c=ceramics', label: 'Ceramics' },
]

export function Navbar() {
  const { count, setOpen, bagRef, bump } = useCart()
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const [scope, animate] = useAnimate<HTMLButtonElement>()

  useEffect(() => {
    bagRef.current = scope.current
    return () => {
      bagRef.current = null
    }
  }, [bagRef, scope])

  useEffect(() => {
    if (bump && scope.current) {
      animate(
        scope.current,
        { scale: [1, 1.18, 0.94, 1.04, 1] },
        { duration: 0.55, ease: 'easeOut' },
      )
    }
  }, [bump, scope, animate])

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 12))

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const lenis = useLenis()
  useEffect(() => {
    if (!menuOpen) return
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen, lenis])

  const currentHref = `${location.pathname}${location.search}`

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="scrim"
            aria-hidden
            className="fixed inset-0 z-30 bg-ink/25 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <header
        className="fixed inset-x-0 top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4"
        style={{ viewTransitionName: 'site-nav' }}
      >
        <motion.nav
          aria-label="Main"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={`mx-auto flex h-16 items-center justify-between rounded-full pr-2 pl-5 transition-[background-color,box-shadow] duration-300 ${
            scrolled || menuOpen
              ? 'bg-card/95 shadow-tile ring-1 ring-line/80 backdrop-blur-xl'
              : 'bg-card/70 ring-1 ring-transparent backdrop-blur-md'
          }`}
        >
          <Link to="/" viewTransition aria-label="KVIST home" className="flex h-11 items-center">
            <BrandMark />
          </Link>

          <LayoutGroup id="nav">
            <ul
              className="hidden items-center gap-1 lg:flex"
              onMouseLeave={() => setHoveredLink(null)}
            >
              {NAV_LINKS.map((item) => {
                const active = currentHref === item.to
                return (
                  <li key={item.to} onMouseEnter={() => setHoveredLink(item.to)}>
                    <Link
                      to={item.to}
                      viewTransition
                      className={`relative isolate block rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                        active ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-ink"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {hoveredLink === item.to && !active && (
                        <motion.span
                          layoutId="nav-hover"
                          className="absolute inset-0 -z-10 rounded-full bg-ink/[0.06]"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </LayoutGroup>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <NavLink
                to="/dashboard"
                viewTransition
                className="hidden h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink sm:inline-flex"
              >
                <LayoutDashboard className="size-4" /> Dashboard
              </NavLink>
            )}

            <Link
              to={user ? '/account' : '/login'}
              viewTransition
              aria-label={user ? 'Your account' : 'Sign in'}
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
            >
              {user ? (
                <span className="grid size-8 place-items-center rounded-full bg-accent text-[12px] font-semibold text-white">
                  {initials(user.name)}
                </span>
              ) : (
                <User className="size-5" />
              )}
            </Link>

            <button
              ref={scope}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
              className="relative flex h-12 items-center gap-2 rounded-full bg-ink pr-3 pl-4 text-[14px] font-medium text-canvas"
            >
              <ShoppingBag className="size-[18px]" />
              <span className="hidden sm:inline">Bag</span>
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-canvas px-1.5 text-[12px] font-semibold text-ink">
                <RollingNumber value={count} />
              </span>
            </button>

            <button
              type="button"
              className="grid size-11 place-items-center rounded-full lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mx-auto mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-[28px] bg-card p-2 shadow-lift ring-1 ring-line lg:hidden"
              data-lenis-prevent
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.ul initial="hide" animate="show" transition={{ staggerChildren: 0.04 }}>
                {[
                  ...NAV_LINKS,
                  ...(isAdmin ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
                  user
                    ? { to: '/account', label: 'Your account' }
                    : { to: '/login', label: 'Sign in' },
                ].map((item) => (
                  <motion.li
                    key={item.to}
                    variants={{
                      hide: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      to={item.to}
                      className="flex min-h-13 items-center rounded-2xl px-4 font-display text-[1.6rem] font-semibold tracking-tight hover:bg-ink/[0.05]"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
