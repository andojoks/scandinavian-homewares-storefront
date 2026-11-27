import { ArrowRight, ArrowUpRight, Check, Leaf, Moon, ShieldCheck, Star, Truck } from 'lucide-react'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { Magnetic } from '../components/Magnetic'
import { Marquee } from '../components/Marquee'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { SectionHeader } from '../components/SectionHeader'
import { SplitHeading } from '../components/SplitHeading'
import { btnPrimary, btnSecondary, eyebrow, inputBase, pillTab } from '../components/ui'
import { useCart } from '../context/CartContext'
import { CATEGORIES, TINT_BG } from '../data/catalog'
import { useCatalog } from '../data/catalogStore'
import { STARTER_PRODUCTS } from '../data/product'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { usePointerParallax } from '../hooks/usePointerParallax'
import { imageAsset } from '../lib/asset'
import { money } from '../lib/format'
import { getBackend } from '../services/backend'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const heroEntrance = (index: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay: 0.15 + index * 0.09, ease: EASE_OUT_EXPO },
})

export default function Home() {
  return (
    <>
      <title>KVIST — Calm objects for slow homes</title>
      <HeroBento />
      <Marquee
        className="py-7 text-ink sm:py-12"
        items={[
          'Solid oak',
          'Wool bouclé',
          'Hand-thrown clay',
          'Washed linen',
          'Made to last',
          'Dispatched in 48h',
        ]}
      />
      <CategoriesSection />
      <FavouritesSection />
      <StorySection />
      <PromiseSection />
      <ReviewsSection />
      <NewsletterSection />
    </>
  )
}

function HeroBento() {
  return (
    <section className="px-3 pt-[5.5rem] sm:px-5 sm:pt-24">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:h-[calc(100svh-7rem)] lg:min-h-[660px] lg:grid-cols-12 lg:grid-rows-6">
        <HeroCopyTile />
        <HeroFeaturedTile />
        <HeroLightingTile />
        <HeroDeliveryTile />
      </div>
    </section>
  )
}

function HeroCopyTile() {
  return (
    <motion.div
      {...heroEntrance(0)}
      className="relative flex flex-col justify-between overflow-hidden tile p-5 sm:col-span-2 sm:p-10 lg:col-span-7 lg:row-span-4"
    >
      <motion.p
        className="inline-flex w-fit items-center gap-2 rounded-full bg-canvas py-1.5 pr-3.5 pl-2 text-[12px] font-medium sm:text-[13px]"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <span className="relative grid size-5 place-items-center">
          <span className="absolute size-2 animate-ping rounded-full bg-accent/60" />
          <span className="size-2 rounded-full bg-accent" />
        </span>
        New season · 9 pieces just landed
      </motion.p>

      <h1 className="mt-5 max-w-[13ch] display text-[2.6rem] sm:mt-10 sm:text-[clamp(3rem,6.6vw,9.5rem)]">
        <SplitHeading text="Calm objects for slow homes." delay={0.35} stagger={0.07} />
      </h1>

      <div className="mt-4 flex flex-col sm:mt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease: EASE_OUT_EXPO }}
        >
          <p className="max-w-[38ch] text-[15px] leading-[1.55] text-ink-soft sm:text-[16px]">
            Solid oak, wool and clay from small workshops. Pieces that get better the longer you
            live with them.
          </p>
          <div className="mt-5 grid grid-cols-[1.35fr_1fr] gap-2.5 sm:mt-6 sm:flex sm:gap-3">
            <Magnetic className="block sm:inline-block">
              <Link
                to="/shop"
                viewTransition
                className={`${btnPrimary} group w-full px-4 sm:w-auto sm:px-6`}
              >
                Shop the edit
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Link to="/shop?c=lighting" viewTransition className={`${btnSecondary} px-4 sm:px-6`}>
              <span className="sm:hidden">Lighting</span>
              <span className="hidden sm:inline">Explore lighting</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="mt-5 flex items-center gap-3 border-t border-line pt-4 sm:mt-0 sm:border-0 sm:pt-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.9, ease: EASE_OUT_EXPO }}
        >
          <div className="flex -space-x-3">
            {[1, 2, 3].map((idx, i) => (
              <motion.img
                key={idx}
                src={imageAsset(`avatar-${idx}.jpg`)}
                alt=""
                width="44"
                height="44"
                className="size-10 rounded-full object-cover ring-[3px] ring-card sm:size-11"
                initial={{ x: -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 1.15 + i * 0.08,
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
              />
            ))}
          </div>
          <div className="text-[13px] leading-tight">
            <p className="flex items-center gap-1 font-medium">
              <Star className="size-3.5 fill-ink" /> 4.9 average
            </p>
            <p className="text-ink-soft">from 2,184 homes</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

const DEFAULT_HERO_PRODUCT = STARTER_PRODUCTS[0]

function HeroFeaturedTile() {
  const { byId } = useCatalog()
  const liveProduct = byId[DEFAULT_HERO_PRODUCT.id]
  const product = liveProduct ?? DEFAULT_HERO_PRODUCT
  const tileRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const { x, y } = usePointerParallax(tileRef, 26)
  const { addWithFlight } = useCart()

  return (
    <motion.div
      {...heroEntrance(1)}
      ref={tileRef}
      className="relative min-h-[440px] overflow-hidden rounded-[var(--radius-tile)] bg-sage sm:col-span-2 sm:min-h-[560px] lg:col-span-5 lg:row-span-6 lg:min-h-0"
    >
      <div className="relative z-10 flex items-start justify-between p-6 sm:p-8">
        <div>
          <p className={eyebrow}>Bestseller</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{product.name}</p>
        </div>
        <SpinningSeal />
      </div>

      <motion.div className="absolute inset-x-[8%] top-[18%] bottom-[14%]" style={{ x, y }}>
        <motion.div
          className="size-full"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.55,
            type: 'spring',
            stiffness: 70,
            damping: 16,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-x-[24%] bottom-[2%] h-[7%] rounded-[50%] bg-[#28321e]/30 blur-2xl"
          />
          <motion.img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            width="923"
            height="923"
            fetchPriority="high"
            className="relative size-full object-contain"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.6,
            }}
          />
        </motion.div>
      </motion.div>

      {liveProduct && (
        <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3 rounded-full bg-card/80 p-2 pl-5 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
          <span className="font-display text-xl font-semibold tabular">{money(product.price)}</span>
          <div className="flex gap-2">
            <Link
              to={`/product/${product.id}`}
              viewTransition
              className="hidden h-11 items-center rounded-full px-4 text-[14px] font-medium hover:bg-ink/5 sm:inline-flex"
            >
              Details
            </Link>
            <button
              onClick={() => addWithFlight(product, imgRef.current)}
              className={`${btnPrimary} h-11 px-5 text-[14px]`}
            >
              Add to bag
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function SpinningSeal() {
  return (
    <motion.div
      className="relative grid size-[84px] shrink-0 place-items-center rounded-full bg-card/70 backdrop-blur"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1, type: 'spring', stiffness: 160, damping: 14 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <defs>
          <path id="badge-circle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <text className="fill-ink font-mono text-[10px] uppercase">
          <textPath href="#badge-circle" textLength="224" lengthAdjust="spacing">
            Wool bouclé · Solid oak ·
          </textPath>
        </text>
      </motion.svg>
      <Leaf className="size-5" aria-hidden />
    </motion.div>
  )
}

function HeroLightingTile() {
  return (
    <motion.div {...heroEntrance(2)} className="lg:col-span-4 lg:row-span-2">
      <Link
        to="/shop?c=lighting"
        viewTransition
        className="group relative flex h-full min-h-[220px] overflow-hidden rounded-[var(--radius-tile)] bg-butter p-6"
      >
        <div className="relative z-10 flex flex-col justify-between">
          <p className={eyebrow}>Lighting</p>
          <div>
            <p className="font-display text-3xl font-semibold tracking-tight">Soft light</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[14px] text-ink-soft">
              3 pieces{' '}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </div>
        </div>
        <motion.img
          src={imageAsset('pendant.webp')}
          alt=""
          width="1100"
          height="1100"
          className="absolute -top-[18%] right-[2%] h-[125%] w-auto max-w-[60%] origin-top object-contain"
          animate={{ rotate: [3, -3, 3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </Link>
    </motion.div>
  )
}

function HeroDeliveryTile() {
  return (
    <motion.div
      {...heroEntrance(3)}
      className="relative flex flex-col justify-between gap-5 overflow-hidden tile p-6 sm:min-h-[220px] lg:col-span-3 lg:row-span-2"
    >
      <p className={eyebrow}>Delivery</p>
      <div>
        <p className="font-display text-3xl leading-none font-semibold tracking-tight">
          Free over <AnimatedNumber value={150} format={(v) => `$${Math.round(v)}`} />
        </p>
        <p className="mt-2 text-[14px] text-ink-soft">Dispatched in 48h. 30-night trial.</p>
      </div>
      <div className="relative h-9 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-x-0 top-1/2 h-px w-[200%] border-t-2 border-dashed border-line"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{ x: ['-12%', '104%'] }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
            repeatDelay: 0.6,
          }}
        >
          <span className="grid size-9 place-items-center rounded-full bg-accent text-white">
            <Truck className="size-[18px]" />
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

function CategoriesSection() {
  const { products } = useCatalog()
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((cat) => [cat.id, products.filter((p) => p.category === cat.id).length]),
      ),
    [products],
  )

  return (
    <section className="px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader
          tight
          eyebrowText="Browse"
          title="Find your corner"
          link={{ to: '/shop', label: 'All products' }}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {CATEGORIES.map((cat, idx) => (
            <Reveal
              key={cat.id}
              delay={idx * 0.07}
              className={idx === 0 ? 'col-span-2 lg:col-span-2 lg:row-span-2' : ''}
            >
              <Link
                to={`/shop?c=${cat.id}`}
                viewTransition
                className={`group relative flex h-full overflow-hidden rounded-[var(--radius-tile)] p-4 sm:p-6 ${TINT_BG[cat.tint]} ${
                  idx === 0
                    ? 'min-h-[300px] p-6 lg:min-h-[520px]'
                    : 'min-h-[200px] sm:min-h-[220px] lg:min-h-0'
                }`}
              >
                <div className="relative z-10 flex w-full items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`font-display font-semibold tracking-tight ${
                        idx === 0 ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {cat.name}
                    </p>
                    <p className="mt-1 text-[14px] text-ink-soft">
                      {counts[cat.id]} {counts[cat.id] === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card/80 transition-[transform,background-color] duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45 group-hover:bg-ink group-hover:text-canvas sm:size-11">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <img
                  src={cat.image}
                  alt=""
                  loading="lazy"
                  width="600"
                  height="600"
                  className={`absolute object-contain transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-3 group-hover:-rotate-3 ${
                    idx === 0 ? 'right-[6%] bottom-[4%] h-[78%]' : 'right-[6%] bottom-[6%] h-[62%]'
                  }`}
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAVOURITE_TABS = [{ id: 'all', name: 'All' }, ...CATEGORIES.filter((c) => c.id !== 'tables')]

function FavouritesSection() {
  const [selected, setSelected] = useState('all')
  const { products } = useCatalog()
  const visible = (
    selected === 'all' ? products : products.filter((p) => p.category === selected)
  ).slice(0, 8)

  return (
    <section className="px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader eyebrowText="Most loved" title="This week’s favourites">
          <LayoutGroup id="fav">
            <div className="-mx-3 w-[calc(100%+1.5rem)] [scrollbar-width:none] overflow-x-auto px-3 py-1 sm:mx-0 sm:w-auto sm:px-0">
              <div
                role="tablist"
                aria-label="Filter favourites"
                className="flex w-max gap-1 rounded-full bg-card p-1 shadow-tile"
              >
                {FAVOURITE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={selected === tab.id}
                    onClick={() => setSelected(tab.id)}
                    className={`${pillTab} h-9 ${
                      selected === tab.id ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {selected === tab.id && (
                      <motion.span
                        layoutId="fav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          </LayoutGroup>
        </SectionHeader>

        <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: idx * 0.04, duration: 0.6, ease: EASE_OUT_EXPO },
                }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                transition={{
                  layout: { type: 'spring', stiffness: 260, damping: 30 },
                }}
              >
                <Reveal delay={(idx % 4) * 0.06}>
                  <ProductCard product={product} />
                </Reveal>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

const STORY_COPY =
  'Every piece is made to be lived with. Sat on, spilled on, moved house twice and handed down. We build for the long version of home.'

function StorySection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress: wordProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 40%'],
  })
  const { scrollYProgress: imgProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(imgProgress, [0, 1], ['-8%', '8%'])
  const words = STORY_COPY.split(' ')

  return (
    <section ref={sectionRef} className="px-3 pt-14 sm:px-5 sm:pt-28">
      <div className="mx-auto grid gap-3 sm:gap-4 lg:grid-cols-12">
        <div className="flex flex-col justify-between tile p-5 sm:p-12 lg:col-span-6">
          <p className={eyebrow}>Our way</p>
          <p
            className="mt-5 font-display text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] sm:mt-10"
            aria-label={STORY_COPY}
          >
            {words.map((word, idx) => (
              <ScrubWord
                key={idx}
                progress={wordProgress}
                range={[idx / words.length, (idx + 1) / words.length]}
              >
                {word}
              </ScrubWord>
            ))}
          </p>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-line pt-5 sm:mt-10 sm:gap-4 sm:pt-6">
            {(
              [
                [12, 'workshops'],
                [100, '% FSC® oak'],
                [10, 'year warranty'],
              ] as const
            ).map(([num, label]) => (
              <div key={label}>
                <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  <AnimatedNumber value={num} />
                </p>
                <p className="text-[13px] text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[var(--radius-tile)] lg:col-span-6 lg:min-h-[640px]">
          <motion.img
            src={imageAsset('interior.jpg')}
            alt="A calm living room with a bouclé chair, low sofa and an oak coffee table"
            loading="lazy"
            width="1536"
            height="1024"
            className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
            style={{ y: imageY }}
          />

          <Reveal
            className="absolute right-5 bottom-5 left-5 flex items-center justify-between gap-3 rounded-2xl bg-card/85 p-4 backdrop-blur-md sm:right-auto sm:w-80"
            y={20}
          >
            <img
              src={imageAsset('table.webp')}
              alt=""
              width="56"
              height="56"
              className="size-14 rounded-xl bg-stone object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">Rund Side Table</p>
              <p className="text-[13px] text-ink-soft">In this room · $640</p>
            </div>
            <Link
              to="/product/rund-side-table"
              viewTransition
              className="grid size-10 place-items-center rounded-full bg-ink text-canvas"
              aria-label="View Rund Side Table"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ScrubWord({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  children: string
}) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span aria-hidden style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  )
}

const PROMISE_ITEMS = [
  {
    icon: Truck,
    value: 48,
    suffix: 'h',
    title: 'Dispatch',
    text: 'In stock pieces leave the workshop within two days.',
    tint: 'bg-sky',
  },
  {
    icon: Moon,
    value: 30,
    suffix: ' nights',
    title: 'Home trial',
    text: 'Live with it for a month. Free returns if it isn’t right.',
    tint: 'bg-blush',
  },
  {
    icon: ShieldCheck,
    value: 10,
    suffix: ' years',
    title: 'Frame warranty',
    text: 'Every frame and joint, for a decade.',
    tint: 'bg-butter',
  },
  {
    icon: Leaf,
    value: 100,
    suffix: '%',
    title: 'Carbon-neutral',
    text: 'Delivery emissions offset, packaging plastic-free.',
    tint: 'bg-sage',
  },
]

function PromiseSection() {
  return (
    <section className="px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader eyebrowText="The promise" title="Buy once, keep for good" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PROMISE_ITEMS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.08}>
              <motion.div
                className={`group flex h-full flex-col justify-between gap-5 rounded-[var(--radius-tile)] p-4 sm:min-h-[260px] sm:p-6 ${item.tint}`}
                whileHover="hover"
              >
                <motion.span
                  className="grid size-10 place-items-center rounded-2xl bg-card sm:size-12"
                  variants={{ hover: { rotate: [0, -12, 10, 0], y: -4 } }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon className="size-5" />
                </motion.span>
                <div>
                  <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                    <AnimatedNumber value={item.value} />
                    <span className="text-lg sm:text-2xl">{item.suffix}</span>
                  </p>
                  <p className="mt-2 font-medium sm:mt-3">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-snug text-ink-soft sm:text-[14px]">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const REVIEWS = [
  {
    name: 'Ines Duarte',
    city: 'Lisbon',
    avatar: 1,
    product: 'Bolle Lounge Chair',
    text: 'It’s become the chair everyone fights over. The bouclé is dense and soft, and it still looks new after a year with a dog.',
  },
  {
    name: 'Jonas Holm',
    city: 'Oslo',
    avatar: 2,
    product: 'Linne Table Lamp',
    text: 'The light it gives is so warm. We turned the ceiling lights off in November and haven’t switched them back on.',
  },
  {
    name: 'Aiko Nakamura',
    city: 'Copenhagen',
    avatar: 3,
    product: 'Vagn Wool Throw',
    text: 'Heavy in the best way. Arrived in two days wrapped in paper, no plastic anywhere. That small thing sold me.',
  },
]

function ReviewsSection() {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <section className="px-3 sm:px-5">
      <div className="mx-auto">
        <SectionHeader eyebrowText="Reviews" title="Lived in, loved back" />
        <motion.div
          className="-mx-3 flex snap-x snap-mandatory scroll-px-3 [scrollbar-width:none] gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
          initial="stacked"
          whileInView="dealt"
          viewport={{ once: true, margin: '0px 0px -20% 0px' }}
        >
          {REVIEWS.map((review, idx) => (
            <motion.figure
              key={review.name}
              className="flex w-[84%] shrink-0 snap-start flex-col justify-between tile p-6 sm:w-[60%] md:w-auto md:p-7"
              variants={
                isDesktop
                  ? {
                      stacked: {
                        opacity: 0,
                        x: `${(1 - idx) * 100}%`,
                        rotate: (idx - 1) * 7,
                        y: 40,
                      },
                      dealt: { opacity: 1, x: '0%', rotate: 0, y: 0 },
                    }
                  : {
                      stacked: { opacity: 0, x: 48 },
                      dealt: { opacity: 1, x: 0 },
                    }
              }
              transition={{
                type: 'spring',
                stiffness: 90,
                damping: 16,
                delay: idx * 0.08,
              }}
              whileHover={{ y: -6, rotate: idx === 1 ? 0 : (idx - 1) * 1.2 }}
            >
              <div>
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star key={starIdx} className="size-4 fill-ink text-ink" />
                  ))}
                </div>
                <blockquote className="mt-4 text-[16px] leading-relaxed md:mt-5 md:text-[17px]">
                  “{review.text}”
                </blockquote>
              </div>

              <figcaption className="mt-6 flex items-center gap-3 md:mt-8">
                <img
                  src={imageAsset(`avatar-${review.avatar}.jpg`)}
                  alt=""
                  width="44"
                  height="44"
                  className="size-11 rounded-full object-cover"
                />
                <div className="text-[14px]">
                  <p className="font-medium">{review.name}</p>
                  <p className="text-ink-soft">
                    {review.city} · {review.product}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  return (
    <section className="px-3 py-14 sm:px-5 sm:py-28">
      <Reveal className="relative grid overflow-hidden rounded-[28px] sm:rounded-[32px] lg:grid-cols-2">
        <div className="relative z-10 bg-ink p-6 text-canvas sm:p-14">
          <p className="font-mono text-[11px] tracking-[0.16em] text-canvas/60 uppercase">
            The letter
          </p>
          <h2 className="mt-3 display text-[clamp(2.15rem,4.6vw,4.25rem)] sm:mt-4">
            First look at new pieces.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-canvas/70 sm:mt-4 sm:text-base">
            One short note when something new leaves the workshop. Never more than twice a month.
          </p>

          <AnimatePresence mode="wait" initial={false}>
            {state === 'done' ? (
              <motion.p
                key="done"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-canvas/10 py-2 pr-5 pl-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <span className="grid size-9 place-items-center rounded-full bg-ok">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                You’re on the list.
              </motion.p>
            ) : (
              <motion.form
                key="form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!/^\S+@\S+\.\S+$/.test(email)) {
                    setState('error')
                    return
                  }
                  setState('sending')
                  try {
                    const backend = await getBackend()
                    await backend.subscribe(email)
                    setState('done')
                  } catch {
                    setState('error')
                  }
                }}
                className="mt-8 flex max-w-md flex-col gap-2 min-[400px]:flex-row"
                exit={{ opacity: 0, y: -8 }}
                noValidate
              >
                <label htmlFor="nl-email" className="sr-only">
                  Email address
                </label>
                <motion.input
                  id="nl-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@home.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (state === 'error') setState('idle')
                  }}
                  aria-invalid={state === 'error'}
                  className={`${inputBase} bg-canvas/10 text-canvas ring-canvas/20 placeholder:text-canvas/45 focus:bg-canvas/15 focus:ring-canvas`}
                  animate={state === 'error' ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="h-12 shrink-0 rounded-2xl bg-canvas px-5 text-[15px] font-medium text-ink transition-transform active:scale-95"
                >
                  {state === 'sending' ? 'Joining…' : 'Join'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {state === 'error' && (
            <p className="mt-2 text-[13px] text-[#f0a597]">Please enter a valid email address.</p>
          )}
        </div>

        <div className="relative min-h-[220px] sm:min-h-[300px]">
          <img
            src={imageAsset('cta.jpg')}
            alt="Two friends talking on a sofa over coffee"
            loading="lazy"
            width="1536"
            height="1024"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </Reveal>
    </section>
  )
}
