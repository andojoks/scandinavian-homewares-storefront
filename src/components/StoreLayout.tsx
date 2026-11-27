import { useLenis } from 'lenis/react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useCart } from '../context/CartContext'
import { CartDrawer } from './CartDrawer'
import { CartFlights } from './CartFlights'
import { CartToast } from './CartToast'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function StoreLayout() {
  const { open } = useCart()
  const { pathname } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
    lenis?.resize()
  }, [pathname, lenis])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="overflow-x-clip" inert={open || undefined}>
        <Outlet />
      </main>
      <div inert={open || undefined}>
        <Footer />
      </div>
      <CartDrawer />
      <CartFlights />
      <CartToast />
    </>
  )
}
