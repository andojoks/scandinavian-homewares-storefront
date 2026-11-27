import { MotionConfig } from 'motion/react'
import { Outlet, ScrollRestoration } from 'react-router'
import { SmoothScroll } from './components/SmoothScroll'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

export function Root() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CartProvider>
          <SmoothScroll>
            <Outlet />
          </SmoothScroll>
          <ScrollRestoration getKey={(location) => location.pathname} />
        </CartProvider>
      </AuthProvider>
    </MotionConfig>
  )
}
