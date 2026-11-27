import { Plus, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'
import { TINT_BG, type TintName } from '../data/catalog'
import { useCategories } from '../data/catalogStore'
import { categoryLabel, type Product } from '../data/product'
import { money } from '../lib/format'

export type ProductTileItem = Pick<
  Product,
  'id' | 'name' | 'category' | 'price' | 'tint' | 'image' | 'badge' | 'rating' | 'reviews'
> & {
  tint: TintName
}

export function ProductCard({
  product,
  priority = false,
  className = '',
}: {
  product: ProductTileItem
  priority?: boolean
  className?: string
}) {
  const { addWithFlight } = useCart()
  const { byId } = useCategories()
  const imgRef = useRef<HTMLImageElement | null>(null)

  return (
    <motion.article
      className={`group relative ${className}`}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <Link
        to={`/product/${product.id}`}
        viewTransition
        onClick={() => {
          document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
            if (img.style.viewTransitionName === 'product-hero') {
              img.style.viewTransitionName = ''
            }
          })
          if (imgRef.current) {
            imgRef.current.style.viewTransitionName = 'product-hero'
          }
        }}
        className="block rounded-[var(--radius-tile)] focus-visible:outline-offset-4"
      >
        <div
          className={`relative aspect-[4/5] overflow-hidden rounded-[var(--radius-tile)] ${TINT_BG[product.tint]}`}
        >
          {product.badge && (
            <span className="absolute top-4 left-4 z-10 rounded-full bg-card/90 px-3 py-1 text-[12px] font-medium backdrop-blur">
              {product.badge}
            </span>
          )}
          <motion.span
            aria-hidden
            className="absolute bottom-[13%] left-1/2 h-6 w-[58%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-md"
            variants={{
              rest: { scaleX: 1, opacity: 0.55 },
              hover: { scaleX: 0.78, opacity: 0.32 },
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <motion.div
            className="absolute inset-[11%] bottom-[15%]"
            variants={{
              rest: { y: 0, rotate: 0 },
              hover: { y: -14, rotate: -2 },
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <img
              ref={imgRef}
              src={product.image}
              alt={product.name}
              width="600"
              height="600"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="size-full object-contain"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 px-1 pt-3 sm:px-1.5 sm:pt-4">
          <p className="col-span-2 text-[12px] text-ink-soft sm:col-span-1 sm:text-[13px]">
            {categoryLabel(product.category, byId)}
          </p>
          <h3 className="col-span-2 text-[15px] leading-snug font-medium sm:col-span-1 sm:row-start-2 sm:truncate sm:text-[17px]">
            {product.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-soft sm:row-start-3 sm:text-[13px]">
            {product.reviews > 0 ? (
              <>
                <Star className="size-3.5 fill-ink text-ink" /> {product.rating}{' '}
                <span className="text-ink-faint">({product.reviews})</span>
              </>
            ) : (
              'New'
            )}
          </p>
          <p className="mt-1 text-right font-display text-[17px] font-semibold tabular sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:self-end sm:text-xl">
            {money(product.price)}
          </p>
        </div>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5]">
        <motion.button
          type="button"
          onClick={() => addWithFlight(product as Product, imgRef.current)}
          aria-label={`Add ${product.name} to bag`}
          className="pointer-events-auto absolute right-4 bottom-4 grid size-12 place-items-center rounded-full bg-ink text-canvas shadow-lift transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
          variants={{ rest: { y: 8, rotate: -90 }, hover: { y: 0, rotate: 0 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          whileTap={{ scale: 0.88 }}
        >
          <Plus className="size-5" />
        </motion.button>
      </div>
    </motion.article>
  )
}
