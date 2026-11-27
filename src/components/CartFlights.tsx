import { motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'

export function CartFlights() {
  const { flights, land } = useCart()

  return createPortal(
    flights.map((flight) => {
      const size = Math.min(flight.from.width, flight.from.height, 220)
      const startX = flight.from.left + flight.from.width / 2 - size / 2
      const startY = flight.from.top + flight.from.height / 2 - size / 2
      const endX = flight.to.left + flight.to.width / 2 - size / 2
      const endY = flight.to.top + flight.to.height / 2 - size / 2
      const lift = Math.min(160, Math.abs(endY - startY) * 0.35 + 60)
      const peakY = Math.max(endY - 50, Math.min(startY, endY) - lift)

      return (
        <motion.img
          key={flight.key}
          src={flight.src}
          alt=""
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[60] object-contain drop-shadow-xl"
          style={{ width: size, height: size }}
          initial={{ x: startX, y: startY, scale: 1, rotate: 0, opacity: 1 }}
          animate={{
            x: endX,
            y: [startY, peakY, endY],
            scale: [1, 0.7, 0.12],
            rotate: [0, -14, 8],
            opacity: [1, 1, 0.9],
          }}
          transition={{
            x: { duration: 0.85, ease: [0.45, 0, 0.2, 1] },
            y: { duration: 0.85, ease: ['easeOut', 'easeIn'], times: [0, 0.4, 1] },
            scale: { duration: 0.85, ease: 'easeIn' },
            rotate: { duration: 0.85 },
            opacity: { duration: 0.85 },
          }}
          onAnimationComplete={() => land(flight)}
        />
      )
    }),
    document.body,
  )
}
