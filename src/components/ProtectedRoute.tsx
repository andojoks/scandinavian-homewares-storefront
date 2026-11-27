import { ShieldAlert } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { btnPrimary } from './ui'

export function ProtectedRoute({
  admin = false,
  children,
}: {
  admin?: boolean
  children: ReactNode
}) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[80vh] place-items-center">
        <motion.span
          className="size-10 rounded-full border-2 border-line border-t-ink"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  if (admin && !isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <motion.div
          className="max-w-md tile p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShieldAlert className="mx-auto size-10 text-warn" />
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Admins only</h1>
          <p className="mt-2 text-ink-soft">
            The dashboard is for store staff. Ask an owner to set{' '}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-[13px]">
              role: &quot;admin&quot;
            </code>{' '}
            on your user in Firestore.
          </p>
          <Link to="/" className={`${btnPrimary} mt-6`}>
            Back to the store
          </Link>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
