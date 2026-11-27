import { motion } from 'motion/react'
import { Link } from 'react-router'
import { btnPrimary } from '../components/ui'
import { imageAsset } from '../lib/asset'

export default function NotFound() {
  return (
    <section className="grid min-h-[86vh] place-items-center px-6 pt-24">
      <title>Not found — KVIST</title>
      <div className="text-center">
        <motion.img
          src={imageAsset('stool.webp')}
          alt=""
          className="mx-auto h-48 w-auto"
          initial={{ rotate: 0, y: -40, opacity: 0 }}
          animate={{
            rotate: [0, 0, -18, -12],
            y: [-40, 0, 0, 6],
            opacity: 1,
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.4, 0.75, 1],
            ease: 'easeOut',
          }}
        />
        <h1 className="mt-6 display text-6xl">This page wobbled off.</h1>
        <p className="mt-3 text-ink-soft">The link may be old, or the piece has moved.</p>
        <Link to="/" viewTransition className={`${btnPrimary} mt-8`}>
          Back home
        </Link>
      </div>
    </section>
  )
}
