import { ArrowUpRight, Check, LoaderCircle, Lock, Pencil, Plus, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { RollingNumber } from '../../components/RollingNumber'
import { SplitHeading } from '../../components/SplitHeading'
import { useCategories } from '../../data/catalogStore'
import {
  findDuplicateCategory,
  normalizeCategoryName,
  validateCategoryName,
  type CategoryRecord,
} from '../../data/product'
import { friendlyCatalogError, getBackend } from '../../services/backend'
import { ConfirmDialog, fieldInput } from './ConfirmDialog'
import { useDashboardContext } from './DashboardLayout'
import { DashToast, useDashToast, type ToastTone } from './DashToast'
import { NewCategoryForm } from './NewCategoryForm'

export default function Categories() {
  const { catalog } = useDashboardContext()
  const { categories, loaded, error } = useCategories()

  const [adding, setAdding] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [deletingCat, setDeletingCat] = useState<CategoryRecord | null>(null)
  const { toast, notify, dismiss } = useDashToast()

  const countsByCategory = useMemo(() => {
    const map: Record<string, { live: number; draft: number }> = {}
    for (const product of catalog.products) {
      map[product.category] ??= { live: 0, draft: 0 }
      map[product.category][product.status === 'active' ? 'live' : 'draft'] += 1
    }
    return map
  }, [catalog.products])

  const addedCount = categories.filter((c) => !c.builtIn).length

  return (
    <div className="space-y-3 sm:space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 px-1 pt-2 pb-1 lg:pt-3">
        <div>
          <p className="text-[14px] text-ink-soft">
            <RollingNumber value={categories.length} /> categories · {addedCount} added
          </p>
          <h1 className="mt-1 display text-[clamp(2.2rem,3.6vw,3.25rem)]">
            <SplitHeading text="Categories" />
          </h1>
        </div>

        <motion.button
          type="button"
          onClick={() => setAdding(true)}
          disabled={adding || Boolean(error)}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-canvas transition-colors hover:bg-[#33312c] disabled:opacity-60 sm:w-auto"
          whileTap={{ scale: 0.96 }}
        >
          <Plus className="size-4" /> New category
        </motion.button>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl bg-[#f8e3df] px-4 py-3 text-[14px] text-danger">
          Couldn’t load categories: {error.message}
        </p>
      )}

      <AnimatePresence initial={false}>
        {adding && (
          <NewCategoryForm
            categories={categories}
            existingIsError
            hint="It appears in the shop’s filters once a live product uses it."
            onDone={(createdId, msg) => {
              setAdding(false)
              if (createdId && msg) notify(msg)
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="overflow-hidden tile"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hidden grid-cols-[1.6fr_1fr_auto] gap-4 border-b border-line px-6 py-3.5 font-mono text-[11px] tracking-[0.12em] text-ink-soft uppercase md:grid">
          <span>Category</span>
          <span>Products</span>
          <span className="w-[116px] text-right">Actions</span>
        </div>

        <ul>
          <AnimatePresence initial={false}>
            {categories.map((cat, idx) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                idx={idx}
                counts={countsByCategory[cat.id] ?? { live: 0, draft: 0 }}
                categories={categories}
                renaming={renamingId === cat.id}
                onRename={() => setRenamingId(cat.id)}
                onRenamed={(msg) => {
                  setRenamingId(null)
                  if (msg) notify(msg)
                }}
                onDelete={() => setDeletingCat(cat)}
              />
            ))}
          </AnimatePresence>
        </ul>

        {!loaded && (
          <p className="px-6 py-4 text-[13px] text-ink-soft">Loading added categories…</p>
        )}
      </motion.div>

      <p className="px-1 text-[13px] leading-relaxed text-ink-soft">
        <Lock className="-mt-0.5 mr-1 inline size-3.5" />
        Built-in categories are part of the home page layout, so they can’t be renamed or deleted
        here. Change them in{' '}
        <code className="rounded bg-card px-1.5 py-0.5 text-[12px]">src/data/catalog.ts</code>.
      </p>

      <AnimatePresence>
        {deletingCat && (
          <DeleteCategoryModal
            category={deletingCat}
            counts={countsByCategory[deletingCat.id] ?? { live: 0, draft: 0 }}
            categories={categories}
            onClose={(msg, tone) => {
              setDeletingCat(null)
              if (msg) notify(msg, tone)
            }}
          />
        )}
      </AnimatePresence>

      <DashToast toast={toast} onClose={dismiss} />
    </div>
  )
}

function CategoryRow({
  category,
  idx,
  counts,
  categories,
  renaming,
  onRename,
  onRenamed,
  onDelete,
}: {
  category: CategoryRecord
  idx: number
  counts: { live: number; draft: number }
  categories: CategoryRecord[]
  renaming: boolean
  onRename: () => void
  onRenamed: (msg?: string) => void
  onDelete: () => void
}) {
  const totalCount = counts.live + counts.draft

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
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3.5 sm:gap-x-4 sm:px-6 md:grid-cols-[1.6fr_1fr_auto]">
        <div className="col-start-1 row-start-1 min-w-0">
          {renaming ? (
            <InlineRenameForm category={category} categories={categories} onDone={onRenamed} />
          ) : (
            <p className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[15px] font-medium">{category.name}</span>
              {category.builtIn ? (
                <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-soft ring-1 ring-line">
                  Built in
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                  Added
                </span>
              )}
            </p>
          )}
        </div>

        <p className="col-start-1 row-start-2 text-[13px] text-ink-soft tabular md:col-start-auto md:row-start-auto">
          {totalCount === 0
            ? 'No products yet'
            : `${counts.live} live${
                counts.draft ? ` · ${counts.draft} ${counts.draft === 1 ? 'draft' : 'drafts'}` : ''
              }`}
        </p>

        <div className="col-start-2 row-span-2 row-start-1 -mr-2 flex justify-end md:[grid-column:auto] md:[grid-row:auto] md:row-span-1 md:mr-0 md:w-[116px] md:gap-1">
          <Link
            to={`/dashboard/products?category=${encodeURIComponent(category.id)}`}
            viewTransition
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink md:size-9"
            aria-label={`See products in ${category.name}`}
            title="See its products"
          >
            <ArrowUpRight className="size-4" />
          </Link>

          {!category.builtIn && !renaming && (
            <>
              <button
                type="button"
                onClick={onRename}
                className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink md:size-9"
                aria-label={`Rename ${category.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-[#f8e3df] hover:text-danger md:size-9"
                aria-label={`Delete ${category.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  )
}

function InlineRenameForm({
  category,
  categories,
  onDone,
}: {
  category: CategoryRecord
  categories: CategoryRecord[]
  onDone: (msg?: string) => void
}) {
  const [rawName, setRawName] = useState(category.name)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy) return
    const normalized = normalizeCategoryName(rawName)
    if (normalized === category.name) {
      onDone()
      return
    }
    const validationErr = validateCategoryName(normalized)
    if (validationErr) {
      setError(validationErr)
      return
    }
    const duplicate = findDuplicateCategory(categories, normalized, category.id)
    if (duplicate) {
      setError(`${duplicate.name} already exists.`)
      return
    }

    setBusy(true)
    try {
      const backend = await getBackend()
      await backend.renameCategory(category.id, normalized)
      onDone(`Renamed to ${normalized}`)
    } catch (err) {
      setError(friendlyCatalogError(err))
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={rawName}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            setRawName(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void submit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              onDone()
            }
          }}
          disabled={busy}
          aria-label={`New name for ${category.name}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `rename-${category.id}-error` : undefined}
          className={`${fieldInput.replace('h-11', 'h-10')} max-w-72`}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-canvas disabled:opacity-60"
          aria-label="Save name"
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" strokeWidth={3} />
          )}
        </button>

        <button
          type="button"
          onClick={() => onDone()}
          disabled={busy}
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft ring-1 ring-line hover:bg-canvas"
          aria-label="Cancel rename"
        >
          <X className="size-4" />
        </button>
      </div>

      {error && (
        <p id={`rename-${category.id}-error`} role="alert" className="mt-1 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function DeleteCategoryModal({
  category,
  counts,
  categories,
  onClose,
}: {
  category: CategoryRecord
  counts: { live: number; draft: number }
  categories: CategoryRecord[]
  onClose: (msg?: string, tone?: ToastTone) => void
}) {
  const totalCount = counts.live + counts.draft
  const otherCategories = categories.filter((c) => c.id !== category.id)
  const [targetId, setTargetId] = useState(otherCategories[0]?.id ?? '')
  const [busy, setBusy] = useState(false)

  return (
    <ConfirmDialog
      title={`Delete ${category.name}?`}
      confirmLabel={totalCount ? `Move ${totalCount} and delete` : 'Delete category'}
      tone="danger"
      busy={busy}
      onConfirm={async () => {
        setBusy(true)
        try {
          const backend = await getBackend()
          await backend.deleteCategory(category.id, totalCount ? targetId : null)
          const destName = otherCategories.find((c) => c.id === targetId)?.name
          onClose(
            totalCount
              ? `${category.name} was deleted. ${totalCount} ${
                  totalCount === 1 ? 'product moved' : 'products moved'
                } to ${destName}.`
              : `${category.name} was deleted`,
          )
        } catch (err) {
          onClose(friendlyCatalogError(err), 'error')
        }
      }}
      onCancel={() => onClose()}
    >
      {totalCount ? (
        <>
          <p>
            {totalCount} {totalCount === 1 ? 'product uses' : 'products use'} it ({counts.live} live
            {counts.draft ? `, ${counts.draft} ${counts.draft === 1 ? 'draft' : 'drafts'}` : ''}
            ). Pick where {totalCount === 1 ? 'it goes' : 'they go'}:
          </p>
          <label className="mt-3 block">
            <span className="sr-only">Move products to</span>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={busy}
              className={fieldInput}
            >
              {otherCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3">Its shop page goes away. This can’t be undone.</p>
        </>
      ) : (
        <p>No products use it. Its shop page goes away. This can’t be undone.</p>
      )}
    </ConfirmDialog>
  )
}
