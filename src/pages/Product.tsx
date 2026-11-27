import { Check, ChevronRight, Leaf, Minus, Plus, RotateCcw, Star, Truck } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { RollingNumber } from '../components/RollingNumber'
import { SplitHeading } from '../components/SplitHeading'
import { btnPrimary, eyebrow } from '../components/ui'
import { useCart } from '../context/CartContext'
import { TINT_BG } from '../data/catalog'
import { useCatalog, useCategories } from '../data/catalogStore'
import { categoryLabel, type Product } from '../data/product'
import { usePointerParallax } from '../hooks/usePointerParallax'
import { money } from '../lib/format'
import NotFound from './NotFound'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: EASE_OUT_EXPO },
})

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { byId, loaded } = useCatalog()
  const product = id ? byId[id] : undefined

  if (product) {
    return <ProductDetail key={product.id} product={product} />
  }
  if (loaded) {
    return <NotFound />
  }
  return <div className="min-h-[80vh]" aria-busy="true" />
}

function ProductDetail({ product }: { product: Product }) {
  const { byId: categoriesById } = useCategories()
  const cat = { id: product.category, name: categoryLabel(product.category, categoriesById) }
  const { addWithFlight } = useCart()
  const { products } = useCatalog()

  const [finish, setFinish] = useState(product.finishes[0]?.name ?? '')
  const [qty, setQty] = useState(1)
  const [stageMode, setStageMode] = useState<'product' | 'scene'>('product')
  const [addedFlash, setAddedFlash] = useState(false)

  const stageRef = useRef<HTMLDivElement | null>(null)
  const heroImgRef = useRef<HTMLImageElement | null>(null)
  const { x, y } = usePointerParallax(stageRef, 30)

  const related = products
    .filter(
      (p) => p.id !== product.id && (p.category === product.category || p.tint === product.tint),
    )
    .slice(0, 4)

  const mainAddBtnRef = useRef<HTMLButtonElement | null>(null)
  const mobileBarImgRef = useRef<HTMLImageElement | null>(null)
  const showStickyCta = !useInView(mainAddBtnRef, { margin: '0px 0px -40px 0px' })

  useEffect(() => {
    document.body.toggleAttribute('data-cta', showStickyCta)
    return () => document.body.removeAttribute('data-cta')
  }, [showStickyCta])

  const handleAdd = (sourceOverride?: HTMLElement | null) => {
    const source =
      sourceOverride ?? (stageMode === 'product' ? heroImgRef.current : stageRef.current)
    addWithFlight(product, source, { qty, finish })
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 1800)
  }

  return (
    <>
      <title>{`${product.name} — KVIST`}</title>
      <section className="px-3 pt-24 sm:px-5 sm:pt-28">
        <nav
          aria-label="Breadcrumb"
          className="mb-2 flex min-w-0 items-center gap-1 px-1 text-[13px] text-ink-soft"
        >
          <Link to="/shop" viewTransition className="py-2.5 hover:text-ink">
            Shop
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to={`/shop?c=${cat.id}`} viewTransition className="py-2.5 hover:text-ink">
            {cat.name}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-ink" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="mx-auto grid gap-3 sm:gap-4 lg:grid-cols-12">
          <div
            ref={stageRef}
            className={`relative aspect-square overflow-hidden rounded-[var(--radius-tile)] lg:col-span-7 lg:aspect-auto lg:min-h-[720px] ${TINT_BG[product.tint]}`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {stageMode === 'product' ? (
                <motion.div
                  key="product"
                  className="absolute inset-[12%]"
                  exit={{ opacity: 0, y: -30 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                >
                  <motion.div className="size-full" style={{ x, y }}>
                    <span
                      aria-hidden
                      className="absolute inset-x-[30%] -bottom-[1%] h-[6%] rounded-[50%] bg-[#1e1e14]/25 blur-2xl"
                    />
                    <img
                      ref={heroImgRef}
                      src={product.image}
                      alt={product.name}
                      width="1000"
                      height="1000"
                      fetchPriority="high"
                      className="relative size-full object-contain"
                      style={{ viewTransitionName: 'product-hero' }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.img
                  key="scene"
                  src={product.scene ?? ''}
                  alt={`${product.name} in a room`}
                  className="absolute inset-0 size-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </AnimatePresence>

            {product.scene && (
              <LayoutGroup id="stage-view">
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-card/85 p-1 backdrop-blur-md">
                  {(
                    [
                      ['product', 'Product'],
                      ['scene', 'In the room'],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setStageMode(mode)}
                      aria-pressed={stageMode === mode}
                      className={`relative isolate h-10 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors ${
                        stageMode === mode ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {stageMode === mode && (
                        <motion.span
                          layoutId="stage-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-ink"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            )}
          </div>

          <div className="flex flex-col tile p-5 sm:p-10 lg:col-span-5">
            <motion.div className="flex items-center justify-between" {...fadeUp(0.15)}>
              <p className={eyebrow}>{cat.name}</p>
              {product.badge && (
                <span className="rounded-full bg-canvas px-3 py-1 text-[12px] font-medium">
                  {product.badge}
                </span>
              )}
            </motion.div>

            <h1 className="mt-4 display text-[clamp(2.6rem,4.4vw,4.25rem)]">
              <SplitHeading text={product.name} delay={0.2} />
            </h1>

            <motion.div className="mt-4 flex items-center gap-4" {...fadeUp(0.35)}>
              <span className="font-display text-3xl font-semibold tabular">
                {money(product.price)}
              </span>
              <span className="flex items-center gap-1 text-[14px] text-ink-soft">
                {product.reviews > 0 ? (
                  <>
                    <Star className="size-4 fill-ink text-ink" /> {product.rating} ·{' '}
                    {product.reviews} reviews
                  </>
                ) : (
                  'No reviews yet'
                )}
              </span>
            </motion.div>

            <motion.p className="mt-5 text-[16px] leading-relaxed text-ink-soft" {...fadeUp(0.42)}>
              {product.blurb}
            </motion.p>

            <motion.fieldset className="mt-7" {...fadeUp(0.5)}>
              <legend className="text-[14px] font-medium">
                Finish <span className="font-normal text-ink-soft">· {finish}</span>
              </legend>
              <LayoutGroup id="finish">
                <div className="mt-3 flex gap-2.5">
                  {product.finishes.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setFinish(f.name)}
                      aria-pressed={finish === f.name}
                      aria-label={f.name}
                      className="relative grid size-12 place-items-center rounded-full"
                    >
                      {finish === f.name && (
                        <motion.span
                          layoutId="finish-ring"
                          className="absolute inset-0 rounded-full ring-2 ring-ink"
                          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        />
                      )}
                      <motion.span
                        className="size-9 rounded-full ring-1 ring-ink/10"
                        style={{ backgroundColor: f.color }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </motion.fieldset>

            <motion.div className="mt-7 flex gap-3" {...fadeUp(0.58)}>
              <div className="flex h-14 items-center rounded-full bg-canvas ring-1 ring-line">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-12 place-items-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center font-medium" aria-live="polite">
                  <RollingNumber value={qty} />
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="grid size-12 place-items-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <motion.button
                ref={mainAddBtnRef}
                onClick={() => handleAdd()}
                className={`${btnPrimary} h-14 min-w-0 flex-1 overflow-hidden px-4 text-[16px]`}
                whileTap={{ scale: 0.97 }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {addedFlash ? (
                    <motion.span
                      key="added"
                      className="inline-flex items-center gap-2"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                    >
                      <Check className="size-5" strokeWidth={3} /> Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                    >
                      Add to bag
                      <span className="hidden min-[400px]:inline">
                        {' '}
                        · {money(product.price * qty)}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <motion.ul
              className="mt-6 flex flex-wrap gap-2 text-[13px] text-ink-soft sm:text-[14px]"
              {...fadeUp(0.66)}
            >
              {(
                [
                  [Truck, 'Ships in 48h'],
                  [RotateCcw, '30-night trial'],
                  [Leaf, 'FSC® materials'],
                ] as const
              ).map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-2 rounded-full bg-canvas px-3 py-2">
                  <Icon className="size-4 text-ink" /> {text}
                </li>
              ))}
            </motion.ul>

            <motion.div className="mt-auto pt-8" {...fadeUp(0.74)}>
              <ProductTabs product={product} />
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center gap-3 rounded-[22px] bg-card/90 p-2 shadow-lift ring-1 ring-line backdrop-blur-xl">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl ${TINT_BG[product.tint]}`}
              >
                <img
                  ref={mobileBarImgRef}
                  src={product.image}
                  alt=""
                  className="size-9 object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{product.name}</span>
                <span className="block text-[13px] text-ink-soft tabular">
                  {money(product.price * qty)} · {finish}
                </span>
              </span>
              <motion.button
                onClick={() => handleAdd(mobileBarImgRef.current)}
                className={`${btnPrimary} h-12 shrink-0 px-5 text-[15px]`}
                whileTap={{ scale: 0.95 }}
              >
                {addedFlash ? <Check className="size-5" strokeWidth={3} /> : 'Add to bag'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {related.length > 0 && (
        <section className="px-3 pt-14 pb-12 sm:px-5 sm:pt-20 sm:pb-24">
          <div className="mx-auto">
            <h2 className="mb-5 display text-[clamp(2rem,4vw,3.5rem)] sm:mb-8">
              <SplitHeading text="Pairs well with" inView />
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
              {related.map((rel, idx) => (
                <Reveal key={rel.id} delay={idx * 0.07}>
                  <ProductCard product={rel} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<'details' | 'dimensions' | 'care'>('details')

  const tabs: [typeof tab, string][] = [
    ['details', 'Details'],
    ['dimensions', 'Dimensions'],
    ['care', 'Care'],
  ]

  return (
    <div>
      <LayoutGroup id="pdp-tabs">
        <div role="tablist" className="flex gap-6 border-b border-line">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setTab(key)}
              className={`relative px-1 py-3 text-[14px] font-medium transition-colors ${
                tab === key ? 'text-ink' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {label}
              {tab === key && (
                <motion.span
                  layoutId="tab-line"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          ))}
        </div>
      </LayoutGroup>

      <div className="relative min-h-[132px] pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-[15px] text-ink-soft"
          >
            {tab === 'details' && (
              <ul className="space-y-2">
                {product.details.map((line) => (
                  <li key={line} className="flex items-center gap-2.5">
                    <span className="size-1.5 rounded-full bg-ink" /> {line}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'dimensions' && <p>{product.dimensions}</p>}
            {tab === 'care' && <p>{product.care}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
