import { Search, X } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { RollingNumber } from '../components/RollingNumber'
import { SplitHeading } from '../components/SplitHeading'
import { eyebrow, pillTab } from '../components/ui'
import { useCatalog, useCategories } from '../data/catalogStore'
import type { Product } from '../data/product'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating'

const SORT_OPTIONS: Record<SortKey, { label: string; fn: (a: Product, b: Product) => number }> = {
  featured: { label: 'Featured', fn: () => 0 },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  rating: { label: 'Top rated', fn: (a, b) => b.rating - a.rating },
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, loaded } = useCatalog()
  const { categories, byId } = useCategories()

  const rawCat = searchParams.get('c') ?? ''
  const activeCategory = byId[rawCat] ? rawCat : 'all'

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.builtIn || products.some((p) => p.category === c.id)),
    [categories, products],
  )

  const rawSort = (searchParams.get('sort') ?? '') as SortKey
  const sortKey: SortKey = SORT_OPTIONS[rawSort] ? rawSort : 'featured'
  const query = searchParams.get('q') ?? ''

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all' || value === 'featured') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => activeCategory === 'all' || p.category === activeCategory)
      .filter(
        (p) =>
          !q || `${p.name} ${p.blurb} ${byId[p.category]?.name ?? ''}`.toLowerCase().includes(q),
      )
      .sort(SORT_OPTIONS[sortKey].fn)
  }, [products, byId, activeCategory, sortKey, query])

  const heading = activeCategory === 'all' ? 'Shop all' : byId[activeCategory].name

  return (
    <section className="px-3 pt-24 pb-12 sm:px-5 sm:pt-32 sm:pb-24">
      <title>{`${heading} — KVIST`}</title>
      <div className="mx-auto">
        <div className="flex flex-col gap-5 tile p-5 sm:gap-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={eyebrow}>
              <RollingNumber value={filtered.length} /> {filtered.length === 1 ? 'piece' : 'pieces'}
            </p>
            <h1 key={heading} className="mt-3 display text-[clamp(3rem,7vw,6.5rem)]">
              <SplitHeading text={heading} />
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder="Search oak, linen, lamp…"
                className="h-11 w-full rounded-full bg-canvas pr-10 pl-10 text-[14px] ring-1 ring-line transition-shadow outline-none focus:ring-2 focus:ring-ink sm:w-64 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  onClick={() => updateParam('q', '')}
                  className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-line"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>

            <label className="relative">
              <span className="sr-only">Sort by</span>
              <select
                value={sortKey}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="h-11 w-full appearance-none rounded-full bg-canvas pr-10 pl-4 text-[14px] ring-1 ring-line outline-none focus:ring-2 focus:ring-ink"
              >
                {Object.entries(SORT_OPTIONS).map(([key, opt]) => (
                  <option key={key} value={key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-soft"
              >
                ▾
              </span>
            </label>
          </div>
        </div>

        <LayoutGroup id="shop-filter">
          <div
            role="tablist"
            aria-label="Categories"
            className="mt-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-1"
          >
            {[{ id: 'all', name: 'All' }, ...visibleCategories].map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => updateParam('c', cat.id)}
                className={`${pillTab} shrink-0 ${
                  activeCategory === cat.id ? 'text-canvas' : 'bg-card text-ink-soft hover:text-ink'
                }`}
              >
                {activeCategory === cat.id && (
                  <motion.span
                    layoutId="shop-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                {cat.name}
              </button>
            ))}
          </div>
        </LayoutGroup>

        <motion.div
          layout
          className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 36 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.05 + idx * 0.05,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
                transition={{
                  layout: { type: 'spring', stiffness: 260, damping: 30 },
                }}
              >
                <ProductCard product={product} priority={idx < 4} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filtered.length === 0 && loaded && (
            <motion.div
              className="mt-4 tile p-12 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {query ? (
                <>
                  <p className="font-display text-3xl font-semibold">Nothing matches “{query}”</p>
                  <p className="mt-2 text-ink-soft">Try oak, linen or lamp, or clear the search.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-semibold">Nothing here yet</p>
                  <p className="mt-2 text-ink-soft">
                    New pieces are on their way. Check back soon.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
