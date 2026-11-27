import { ArrowUpRight, Download, Pencil, Plus, Search, Trash2, TriangleAlert } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { RollingNumber } from '../../components/RollingNumber'
import { SplitHeading } from '../../components/SplitHeading'
import { useCategories } from '../../data/catalogStore'
import {
  categoryLabel,
  TINT_BG,
  type CategoryRecord,
  type Product,
  type ProductStatus,
} from '../../data/product'
import { money, timeAgo } from '../../lib/format'
import { inventoryAllocation, type StockRow } from '../../lib/metrics'
import { friendlyCatalogError, getBackend } from '../../services/backend'
import { ConfirmDialog } from './ConfirmDialog'
import { useDashboardContext } from './DashboardLayout'
import { DashToast, useDashToast } from './DashToast'
import { ProductEditor } from './ProductEditor'

type ProductFilterTab = 'all' | 'active' | 'draft' | 'low'

const FILTER_TABS: { id: ProductFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'low', label: 'Low stock' },
]

export default function Products() {
  const { catalog, orders, now } = useDashboardContext()
  const { products, loaded, error } = catalog
  const { categories, byId: categoriesById } = useCategories()

  const [tab, setTab] = useState<ProductFilterTab>('all')
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('category') ?? 'all',
  )
  const effectiveCategory =
    selectedCategory === 'all' || categoriesById[selectedCategory] ? selectedCategory : 'all'

  const [query, setQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(() => new Set())
  const [importing, setImporting] = useState(false)
  const { toast, notify, dismiss } = useDashToast()

  const minuteBucket = Math.floor(now / 60_000) * 60_000
  const stockById = useMemo(() => {
    const rows = inventoryAllocation(
      orders,
      Math.max(minuteBucket, orders[0]?.createdAt ?? 0),
      products,
    )
    return Object.fromEntries(rows.map((r) => [r.product.id, r]))
  }, [orders, products, minuteBucket])

  const orderImpactById = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const order of orders) {
      for (const id of new Set(order.items.map((item) => item.id))) {
        counts[id] = (counts[id] ?? 0) + 1
      }
    }
    return counts
  }, [orders])

  const counts = useMemo(
    () => ({
      all: products.length,
      active: products.filter((p) => p.status === 'active').length,
      draft: products.filter((p) => p.status === 'draft').length,
      low: products.filter((p) => stockById[p.id]?.low).length,
    }),
    [products, stockById],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) =>
        tab === 'all' ? true : tab === 'low' ? stockById[p.id]?.low : p.status === tab,
      )
      .filter((p) => effectiveCategory === 'all' || p.category === effectiveCategory)
      .filter(
        (p) =>
          !q ||
          `${p.name} ${p.id} ${categoryLabel(p.category, categoriesById)}`
            .toLowerCase()
            .includes(q),
      )
  }, [products, tab, effectiveCategory, query, stockById, categoriesById])

  const toggleProductStatus = async (product: Product, status: ProductStatus) => {
    setTogglingIds((prev) => new Set(prev).add(product.id))
    try {
      const backend = await getBackend()
      await backend.updateProduct(product.id, { status })
      notify(
        status === 'active'
          ? `${product.name} is live in the store`
          : `${product.name} is hidden from the store`,
      )
    } catch (err) {
      notify(friendlyCatalogError(err), 'error')
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }
  }

  const confirmDelete = async () => {
    if (!deletingProduct) return
    setDeleteBusy(true)
    try {
      const backend = await getBackend()
      await backend.deleteProduct(deletingProduct.id)
      notify(`${deletingProduct.name} was deleted`)
      if (editingProduct && editingProduct.id === deletingProduct.id) {
        setEditingProduct(undefined)
      }
      setDeletingProduct(null)
    } catch (err) {
      notify(friendlyCatalogError(err), 'error')
    } finally {
      setDeleteBusy(false)
    }
  }

  const hideInsteadOfDelete = async () => {
    if (!deletingProduct) return
    const target = deletingProduct
    setDeletingProduct(null)
    await toggleProductStatus(target, 'draft')
  }

  const handleImportStarter = async () => {
    setImporting(true)
    try {
      const backend = await getBackend()
      await backend.importStarterCatalog()
      notify('The starter products were added')
    } catch (err) {
      notify(friendlyCatalogError(err), 'error')
    } finally {
      setImporting(false)
    }
  }

  const handleSaved = (saved: Product, isNew: boolean) => {
    setEditingProduct(undefined)
    const link =
      saved.status === 'active' ? { to: `/product/${saved.id}`, label: 'View' } : undefined
    notify(
      isNew
        ? `${saved.name} was created${saved.status === 'draft' ? ' as a draft' : ''}`
        : `${saved.name} was saved`,
      'ok',
      link,
    )
  }

  const storeIsEmpty = loaded && !error && products.length === 0

  return (
    <div className="space-y-3 sm:space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 px-1 pt-2 pb-1 lg:pt-3">
        <div>
          <p className="text-[14px] text-ink-soft">
            <RollingNumber value={counts.active} /> live · {counts.draft}{' '}
            {counts.draft === 1 ? 'draft' : 'drafts'}
            {counts.low > 0 && <span className="text-warn"> · {counts.low} low on stock</span>}
          </p>
          <h1 className="mt-1 display text-[clamp(2.2rem,3.6vw,3.25rem)]">
            <SplitHeading text="Products" />
          </h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-64">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or category"
              className="h-11 w-full rounded-full bg-card pr-4 pl-10 text-[14px] shadow-tile ring-ink transition-shadow outline-none focus:ring-2"
            />
          </label>

          <motion.button
            type="button"
            onClick={() => setEditingProduct(null)}
            disabled={Boolean(error)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-canvas transition-colors hover:bg-[#33312c] disabled:opacity-60"
            whileTap={{ scale: 0.96 }}
          >
            <Plus className="size-4" /> New product
          </motion.button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl bg-[#f8e3df] px-4 py-3 text-[14px] text-danger">
          Couldn’t load products:{' '}
          {error.code === 'permission-denied'
            ? 'this account isn’t an admin in Firestore.'
            : error.message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <LayoutGroup id="product-filter">
          <div
            role="tablist"
            aria-label="Filter products"
            className="flex max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto pb-1"
          >
            {FILTER_TABS.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`relative isolate flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors ${
                  tab === item.id ? 'text-canvas' : 'bg-card text-ink-soft hover:text-ink'
                }`}
              >
                {tab === item.id && (
                  <motion.span
                    layoutId="product-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {item.label}
                <span
                  className={`rounded-full px-1.5 text-[12px] tabular ${
                    tab === item.id ? 'bg-canvas/15' : 'bg-canvas'
                  }`}
                >
                  <RollingNumber value={counts[item.id]} />
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        <label className="relative">
          <span className="sr-only">Category</span>
          <select
            value={effectiveCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 appearance-none rounded-full bg-card pr-9 pl-4 text-[14px] font-medium shadow-tile ring-ink outline-none focus:ring-2"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[12px] text-ink-soft"
          >
            ▾
          </span>
        </label>
      </div>

      {storeIsEmpty ? (
        <motion.div
          className="tile p-8 text-center sm:p-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-display text-3xl font-semibold tracking-tight">No products yet</p>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            The store is empty. Add your first product, or start from the nine built-in pieces and
            edit them.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleImportStarter()}
              disabled={importing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium ring-1 ring-line transition-colors hover:bg-canvas disabled:opacity-60"
            >
              <Download className="size-4" /> {importing ? 'Adding…' : 'Add the starter products'}
            </button>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-canvas"
            >
              <Plus className="size-4" /> New product
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="overflow-hidden tile"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hidden grid-cols-[2.4fr_0.8fr_1.3fr_1fr_0.9fr_auto] gap-4 border-b border-line px-6 py-3.5 font-mono text-[11px] tracking-[0.12em] text-ink-soft uppercase md:grid">
            <span>Product</span>
            <span className="text-right">Price</span>
            <span>Stock this week</span>
            <span>In store</span>
            <span>Updated</span>
            <span className="w-[116px] text-right">Actions</span>
          </div>

          {!loaded && <ProductsLoadingSkeleton />}

          <ul>
            <AnimatePresence initial={false}>
              {filtered.map((product, idx) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  categories={categoriesById}
                  idx={idx}
                  stock={stockById[product.id]}
                  now={now}
                  toggling={togglingIds.has(product.id)}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => setDeletingProduct(product)}
                  onStatus={(nextStatus) => void toggleProductStatus(product, nextStatus)}
                />
              ))}
            </AnimatePresence>
          </ul>

          {loaded && filtered.length === 0 && (
            <p className="p-12 text-center text-ink-soft">No products match.</p>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {editingProduct !== undefined && (
          <ProductEditor
            key={editingProduct?.id ?? 'new'}
            product={editingProduct}
            catalog={products}
            onClose={() => setEditingProduct(undefined)}
            onSaved={handleSaved}
            onDelete={(target) => setDeletingProduct(target)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingProduct && (
          <ConfirmDialog
            title={`Delete ${deletingProduct.name}?`}
            confirmLabel="Delete product"
            tone="danger"
            busy={deleteBusy}
            onConfirm={() => void confirmDelete()}
            onCancel={() => setDeletingProduct(null)}
            extra={
              deletingProduct.status === 'active' && (
                <button
                  type="button"
                  onClick={() => void hideInsteadOfDelete()}
                  disabled={deleteBusy}
                  className="h-11 rounded-full px-5 text-[14px] font-medium ring-1 ring-line transition-colors hover:bg-canvas disabled:opacity-60"
                >
                  Hide instead
                </button>
              )
            }
          >
            {orderImpactById[deletingProduct.id] ? (
              <p>
                It’s in {orderImpactById[deletingProduct.id].toLocaleString('en-US')}{' '}
                {orderImpactById[deletingProduct.id] === 1 ? 'order' : 'orders'}. Those orders keep
                their items and totals, but the product page goes away and it drops out of the stock
                and top-product tiles. This can’t be undone.
              </p>
            ) : (
              <p>
                Its product page goes away and shoppers can no longer buy it. This can’t be undone.
              </p>
            )}
            {deletingProduct.status === 'active' && (
              <p className="mt-2">To take it off sale but keep it, hide it instead.</p>
            )}
          </ConfirmDialog>
        )}
      </AnimatePresence>

      <DashToast toast={toast} onClose={dismiss} />
    </div>
  )
}

function ProductRow({
  product,
  categories,
  idx,
  stock,
  now,
  toggling,
  onEdit,
  onDelete,
  onStatus,
}: {
  product: Product
  categories: Record<string, CategoryRecord | undefined>
  idx: number
  stock?: StockRow
  now: number
  toggling: boolean
  onEdit: () => void
  onDelete: () => void
  onStatus: (status: ProductStatus) => void
}) {
  const isLive = product.status === 'active'

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{
        type: 'spring',
        stiffness: 340,
        damping: 32,
        opacity: { delay: Math.min(idx, 12) * 0.025 },
      }}
      className="border-b border-line/70 last:border-0"
    >
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2.5 px-4 py-3.5 sm:gap-x-4 sm:px-6 md:grid-cols-[2.4fr_0.8fr_1.3fr_1fr_0.9fr_auto] md:gap-y-2">
        <button
          type="button"
          onClick={onEdit}
          className="group col-span-2 col-start-1 row-start-1 flex min-w-0 items-center gap-3 text-left md:col-span-1 md:col-start-auto md:row-start-auto"
        >
          <span
            className={`grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl ${
              TINT_BG[product.tint] ?? 'bg-stone'
            }`}
          >
            <img src={product.image} alt="" loading="lazy" className="size-10 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium underline-offset-4 group-hover:underline">
              {product.name}
            </span>
            <span className="block truncate text-[12px] text-ink-soft">
              {categoryLabel(product.category, categories)}
              {product.badge ? ` · ${product.badge}` : ''}
            </span>
          </span>
        </button>

        <span className="col-start-3 row-start-1 text-right font-medium tabular md:col-start-auto md:row-start-auto">
          {money(product.price)}
        </span>

        <div className="col-start-1 row-start-2 min-w-0 md:col-start-auto md:row-start-auto">
          {stock ? (
            <>
              <p
                className={`text-[12px] tabular ${
                  stock.low ? 'font-medium text-warn' : 'text-ink-soft'
                }`}
              >
                {stock.low && <TriangleAlert className="-mt-0.5 mr-1 inline size-3.5" />}
                {stock.onHand} of {product.stock} left
              </p>
              <div className="mt-1.5 h-1.5 max-w-40 overflow-hidden rounded-full bg-canvas">
                <motion.div
                  className={`h-full origin-left rounded-full ${stock.low ? 'bg-warn' : 'bg-ok'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: stock.ratio }}
                  transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                />
              </div>
            </>
          ) : (
            <p className="text-[12px] text-ink-soft">—</p>
          )}
        </div>

        <div className="col-start-2 row-start-2 md:col-start-auto md:row-start-auto">
          <StatusSwitch
            live={isLive}
            busy={toggling}
            name={product.name}
            onChange={(nextLive) => onStatus(nextLive ? 'active' : 'draft')}
          />
        </div>

        <span className="hidden text-[13px] text-ink-soft tabular md:block">
          {product.updatedAt ? timeAgo(product.updatedAt, now) : '—'}
        </span>

        <div className="col-start-3 row-start-2 -mr-2 flex justify-end md:col-start-auto md:row-start-auto md:mr-0 md:w-[116px] md:gap-1">
          {isLive && (
            <Link
              to={`/product/${product.id}`}
              viewTransition
              className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink md:size-9"
              aria-label={`View ${product.name} in the store`}
            >
              <ArrowUpRight className="size-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink md:size-9"
            aria-label={`Edit ${product.name}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-[#f8e3df] hover:text-danger md:size-9"
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </motion.li>
  )
}

function StatusSwitch({
  live,
  busy,
  name,
  onChange,
}: {
  live: boolean
  busy: boolean
  name: string
  onChange: (nextLive: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={live}
      aria-label={`${name} is shown in the store`}
      disabled={busy}
      onClick={() => onChange(!live)}
      className="flex items-center gap-2 text-[13px] font-medium disabled:opacity-60"
    >
      <span
        className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors duration-300 ${
          live ? 'justify-end bg-ok' : 'justify-start bg-line'
        }`}
      >
        <motion.span
          layout
          className="size-5 rounded-full bg-card shadow"
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
        />
      </span>
      <span className={live ? 'text-ok' : 'text-ink-soft'}>{live ? 'Live' : 'Draft'}</span>
    </button>
  )
}

function ProductsLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      {Array.from({ length: 5 }, (_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5 last:border-0 sm:px-6"
        >
          <span className="size-12 animate-pulse rounded-xl bg-canvas" />
          <span className="h-3.5 w-40 animate-pulse rounded-full bg-canvas" />
        </div>
      ))}
    </div>
  )
}
