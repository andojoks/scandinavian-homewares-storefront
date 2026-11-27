import { Check, LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProductCard } from '../../components/ProductCard'
import { useCategories } from '../../data/catalogStore'
import {
  draftsEqual,
  LIMITS,
  productToDraft,
  TINT_BG,
  TINT_NAMES,
  uniqueSlug,
  validateProductDraft,
  type Product,
  type ProductDraft,
  type ProductStatus,
} from '../../data/product'
import { checkImageFile } from '../../lib/image'
import { friendlyCatalogError, getBackend } from '../../services/backend'
import { ConfirmDialog, fieldInput, fieldTextarea } from './ConfirmDialog'
import { BUILT_IN_SCENES, ImagePicker } from './ImagePicker'
import { NewCategoryForm } from './NewCategoryForm'

const BADGE_OPTIONS = ['New', 'Bestseller', 'Limited', 'Low stock', 'Back in stock']
const ADD_CATEGORY_SENTINEL = '__add-category'

export function ProductEditor({
  product,
  catalog,
  onClose,
  onSaved,
  onDelete,
}: {
  product: Product | null
  catalog: Product[]
  onClose: () => void
  onSaved: (saved: Product, isNew: boolean) => void
  onDelete: (target: Product) => void
}) {
  const isNew = !product
  const initialDraft = useMemo(() => productToDraft(product ?? undefined), [product])

  const [draft, setDraft] = useState<ProductDraft>(initialDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [categoryHint, setCategoryHint] = useState('')

  const { categories } = useCategories()
  const formRef = useRef<HTMLFormElement | null>(null)
  const categorySelectRef = useRef<HTMLSelectElement | null>(null)

  const dirty = !draftsEqual(initialDraft, draft)

  const resolvedId = useMemo(
    () =>
      isNew
        ? uniqueSlug(
            draft.name,
            catalog.map((p) => p.id),
          )
        : product.id,
    [isNew, draft.name, catalog, product],
  )

  const requestClose = () => {
    if (saving) return
    if (dirty) {
      setConfirmDiscard(true)
    } else {
      onClose()
    }
  }

  const [returnFocusEl] = useState(() => document.activeElement as HTMLElement | null)

  useEffect(() => () => returnFocusEl?.focus?.(), [returnFocusEl])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmDiscard) requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const setField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const updateFinish = (idx: number, patch: Partial<{ name: string; color: string }>) => {
    setDraft((prev) => ({
      ...prev,
      finishes: prev.finishes.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`finish-${idx}`]
      delete next.finishes
      return next
    })
  }

  const updateDetail = (idx: number, text: string) => {
    setDraft((prev) => ({
      ...prev,
      details: prev.details.map((d, i) => (i === idx ? { ...d, text } : d)),
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`detail-${idx}`]
      return next
    })
  }

  const clearIndexedErrors = () =>
    setErrors((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([k]) => !/^(finish|detail)-/.test(k))),
    )

  const handleUpload = async (file?: File) => {
    if (!file) return
    const fileError = checkImageFile(file)
    if (fileError) {
      setErrors((prev) => ({ ...prev, image: fileError }))
      return
    }
    setUploading(true)
    try {
      const backend = await getBackend()
      const url = await backend.uploadProductImage(file)
      setField('image', url)
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: friendlyCatalogError(err) }))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving || uploading) return
    setFormError('')

    const result = validateProductDraft(
      draft,
      categories.map((c) => c.id),
    )
    if (result.errors) {
      setErrors(result.errors)
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }

    setSaving(true)
    try {
      const backend = await getBackend()
      if (isNew) {
        const position = Math.max(-1, ...catalog.map((p) => p.position)) + 1
        const created: Product = {
          ...result.input,
          id: resolvedId,
          position,
          rating: 0,
          reviews: 0,
        }
        await backend.createProduct(created)
        onSaved(created, true)
      } else {
        await backend.updateProduct(product.id, result.input)
        onSaved({ ...product, ...result.input }, false)
      }
    } catch (err) {
      setFormError(friendlyCatalogError(err))
      setSaving(false)
    }
  }

  const previewProduct: Product = {
    id: resolvedId || 'preview',
    name: draft.name.trim() || 'Product name',
    category: draft.category,
    price: Number(draft.price) || 0,
    stock: Number(draft.stock) || 0,
    status: draft.status,
    position: product?.position ?? 0,
    tint: draft.tint,
    image: draft.image,
    scene: draft.scene || null,
    badge: draft.badge.trim() || null,
    blurb: draft.blurb,
    finishes: draft.finishes.map(({ name, color }) => ({ name, color })),
    details: draft.details.map((d) => d.text),
    dimensions: draft.dimensions,
    care: draft.care,
    rating: product?.rating ?? 0,
    reviews: product?.reviews ?? 0,
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      <motion.div
        className="absolute inset-0 bg-ink/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={requestClose}
      />

      <motion.aside
        className="absolute inset-y-2 right-2 flex w-[min(640px,calc(100vw-16px))] flex-col overflow-hidden tile"
        initial={{ x: '108%' }}
        animate={{ x: 0 }}
        exit={{ x: '108%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      >
        <form
          ref={formRef}
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
                {isNew ? 'New product' : 'Edit product'}
              </p>
              <h2
                id="editor-title"
                className="mt-1 truncate font-display text-3xl font-semibold tracking-tight"
              >
                {draft.name.trim() || 'Untitled'}
              </h2>
            </div>

            <button
              type="button"
              onClick={requestClose}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-canvas transition-transform hover:rotate-90"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div
            className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7"
            data-lenis-prevent
          >
            <div className="grid gap-5 sm:grid-cols-[176px_1fr]">
              <div className="pointer-events-none w-36 max-sm:mx-auto sm:w-44" inert aria-hidden>
                {draft.image ? (
                  <ProductCard product={previewProduct} />
                ) : (
                  <div
                    className={`grid aspect-[4/5] place-items-center rounded-[var(--radius-tile)] text-[13px] text-ink-soft ${
                      TINT_BG[draft.tint] ?? 'bg-stone'
                    }`}
                  >
                    No image yet
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <EditorField
                  label="Name"
                  error={errors.name}
                  hint={
                    isNew && draft.name.trim()
                      ? `Its page will be /product/${resolvedId}`
                      : undefined
                  }
                  count={[draft.name.length, LIMITS.name]}
                >
                  {(props) => (
                    <input
                      {...props}
                      autoFocus
                      value={draft.name}
                      maxLength={LIMITS.name + 20}
                      onChange={(e) => setField('name', e.target.value)}
                      className={fieldInput}
                      autoComplete="off"
                    />
                  )}
                </EditorField>

                <VisibilityPicker
                  value={draft.status}
                  onChange={(status) => setField('status', status)}
                />
              </div>
            </div>

            <EditorSection title="Price and stock">
              <div className="grid gap-4 sm:grid-cols-3">
                <EditorField
                  label="Category"
                  error={errors.category}
                  hint={categoryHint || undefined}
                >
                  {(props) => (
                    <select
                      {...props}
                      ref={categorySelectRef}
                      value={draft.category}
                      onChange={(e) => {
                        setCategoryHint('')
                        if (e.target.value === ADD_CATEGORY_SENTINEL) {
                          setAddingCategory(true)
                        } else {
                          setField('category', e.target.value)
                        }
                      }}
                      className={fieldInput}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value={ADD_CATEGORY_SENTINEL}>+ Add category…</option>
                    </select>
                  )}
                </EditorField>

                <AnimatePresence initial={false}>
                  {addingCategory && (
                    <NewCategoryForm
                      categories={categories}
                      className="sm:order-last sm:col-span-3"
                      onDone={(createdId, message) => {
                        setAddingCategory(false)
                        if (createdId) {
                          setField('category', createdId)
                          setCategoryHint(message ?? '')
                        }
                        requestAnimationFrame(() => categorySelectRef.current?.focus())
                      }}
                    />
                  )}
                </AnimatePresence>

                <EditorField label="Price" error={errors.price} hint="Whole US dollars">
                  {(props) => (
                    <div className="relative">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft"
                      >
                        $
                      </span>
                      <input
                        {...props}
                        inputMode="numeric"
                        value={draft.price}
                        onChange={(e) => setField('price', e.target.value)}
                        className={`${fieldInput} pl-7 tabular`}
                        placeholder="129"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </EditorField>

                <EditorField
                  label="Weekly stock"
                  error={errors.stock}
                  hint="Units you can ship each week"
                >
                  {(props) => (
                    <input
                      {...props}
                      inputMode="numeric"
                      value={draft.stock}
                      onChange={(e) => setField('stock', e.target.value)}
                      className={`${fieldInput} tabular`}
                      autoComplete="off"
                    />
                  )}
                </EditorField>
              </div>
            </EditorSection>

            <EditorSection title="Pictures">
              <ImagePicker
                value={draft.image}
                error={errors.image}
                uploading={uploading}
                onPick={(src) => setField('image', src)}
                onUpload={(file) => void handleUpload(file)}
              />

              <fieldset className="mt-5">
                <legend className="text-[14px] font-medium">Tile colour</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {TINT_NAMES.map((tint) => (
                    <button
                      key={tint}
                      type="button"
                      onClick={() => setField('tint', tint)}
                      aria-pressed={draft.tint === tint}
                      aria-label={tint}
                      className={`grid size-10 place-items-center rounded-full ring-1 ring-ink/10 ${TINT_BG[tint]} ${
                        draft.tint === tint ? 'ring-2 ring-ink' : ''
                      }`}
                    >
                      {draft.tint === tint && <Check className="size-4" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[14px] font-medium">
                  Room photo{' '}
                  <span className="font-normal text-ink-soft">
                    · optional, adds “In the room” to the product page
                  </span>
                </legend>
                <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  <button
                    type="button"
                    onClick={() => setField('scene', '')}
                    aria-pressed={!draft.scene}
                    className={`grid aspect-square place-items-center rounded-xl bg-canvas text-[12px] text-ink-soft ring-1 ring-line ${
                      draft.scene ? '' : 'ring-2 ring-ink'
                    }`}
                  >
                    None
                  </button>
                  {BUILT_IN_SCENES.map((sceneSrc) => (
                    <button
                      key={sceneSrc}
                      type="button"
                      onClick={() => setField('scene', sceneSrc)}
                      aria-pressed={draft.scene === sceneSrc}
                      aria-label={`Room photo ${sceneSrc.split('/').pop()}`}
                      className={`overflow-hidden rounded-xl ring-1 ring-line ${
                        draft.scene === sceneSrc ? 'ring-2 ring-ink' : ''
                      }`}
                    >
                      <img
                        src={sceneSrc}
                        alt=""
                        loading="lazy"
                        className="aspect-square size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
            </EditorSection>

            <EditorSection title="Description">
              <div className="space-y-4">
                <EditorField
                  label="Short description"
                  error={errors.blurb}
                  count={[draft.blurb.length, LIMITS.blurb]}
                >
                  {(props) => (
                    <textarea
                      {...props}
                      rows={3}
                      value={draft.blurb}
                      onChange={(e) => setField('blurb', e.target.value)}
                      className={fieldTextarea}
                      placeholder="What it is, what it’s made of, why it’s nice to live with."
                    />
                  )}
                </EditorField>

                <EditorField
                  label="Badge"
                  error={errors.badge}
                  hint="Optional. Shown on the product tile."
                >
                  {(props) => (
                    <>
                      <input
                        {...props}
                        list="badge-options"
                        value={draft.badge}
                        onChange={(e) => setField('badge', e.target.value)}
                        className={fieldInput}
                        placeholder="e.g. New"
                        autoComplete="off"
                      />
                      <datalist id="badge-options">
                        {BADGE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} />
                        ))}
                      </datalist>
                    </>
                  )}
                </EditorField>
              </div>
            </EditorSection>

            <EditorSection
              title="Finishes"
              note="Shoppers pick one on the product page. The first is the default."
              error={errors.finishes}
            >
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {draft.finishes.map((finish, idx) => (
                    <motion.li
                      key={finish.key}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      <div className="flex items-center gap-2">
                        <label
                          className="relative grid size-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full ring-1 ring-line"
                          style={{ backgroundColor: finish.color }}
                        >
                          <span className="sr-only">Colour of finish {idx + 1}</span>
                          <input
                            type="color"
                            value={finish.color}
                            onChange={(e) => updateFinish(idx, { color: e.target.value })}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                        </label>

                        <input
                          value={finish.name}
                          onChange={(e) => updateFinish(idx, { name: e.target.value })}
                          aria-label={`Name of finish ${idx + 1}`}
                          aria-invalid={Boolean(errors[`finish-${idx}`])}
                          aria-describedby={
                            errors[`finish-${idx}`] ? `finish-${idx}-error` : undefined
                          }
                          className={fieldInput}
                          placeholder="e.g. Oiled oak"
                          autoComplete="off"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            clearIndexedErrors()
                            setDraft((prev) => ({
                              ...prev,
                              finishes: prev.finishes.filter((_, i) => i !== idx),
                            }))
                          }}
                          disabled={draft.finishes.length === 1}
                          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-danger disabled:opacity-40"
                          aria-label={`Remove finish ${finish.name || idx + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      {errors[`finish-${idx}`] && (
                        <p
                          id={`finish-${idx}-error`}
                          className="mt-1 ml-[3.25rem] text-[13px] text-danger"
                        >
                          {errors[`finish-${idx}`]}
                        </p>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {draft.finishes.length < LIMITS.finishes && (
                <AddRowButton
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      finishes: [
                        ...prev.finishes,
                        { key: crypto.randomUUID(), name: '', color: '#d8c4a4' },
                      ],
                    }))
                  }
                >
                  Add a finish
                </AddRowButton>
              )}
            </EditorSection>

            <EditorSection
              title="Details"
              note="Shown on the product page’s Details, Dimensions and Care tabs."
            >
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {draft.details.map((detail, idx) => (
                    <motion.li
                      key={detail.key}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          value={detail.text}
                          onChange={(e) => updateDetail(idx, e.target.value)}
                          aria-label={`Detail ${idx + 1}`}
                          aria-invalid={Boolean(errors[`detail-${idx}`])}
                          className={fieldInput}
                          placeholder="e.g. Solid FSC® oak"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            clearIndexedErrors()
                            setDraft((prev) => ({
                              ...prev,
                              details: prev.details.filter((_, i) => i !== idx),
                            }))
                          }}
                          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-danger"
                          aria-label={`Remove detail ${idx + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {errors[`detail-${idx}`] && (
                        <p className="mt-1 text-[13px] text-danger">{errors[`detail-${idx}`]}</p>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {draft.details.length < LIMITS.details && (
                <AddRowButton
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      details: [...prev.details, { key: crypto.randomUUID(), text: '' }],
                    }))
                  }
                >
                  Add a detail line
                </AddRowButton>
              )}

              <div className="mt-5 space-y-4">
                <EditorField label="Dimensions" error={errors.dimensions}>
                  {(props) => (
                    <input
                      {...props}
                      value={draft.dimensions}
                      onChange={(e) => setField('dimensions', e.target.value)}
                      className={fieldInput}
                      placeholder="W 82 × D 78 × H 74 cm"
                      autoComplete="off"
                    />
                  )}
                </EditorField>

                <EditorField label="Care" error={errors.care}>
                  {(props) => (
                    <textarea
                      {...props}
                      rows={2}
                      value={draft.care}
                      onChange={(e) => setField('care', e.target.value)}
                      className={fieldTextarea}
                      placeholder="How to clean and look after it."
                    />
                  )}
                </EditorField>
              </div>
            </EditorSection>
          </div>

          <div className="border-t border-line px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
            <AnimatePresence>
              {formError && (
                <motion.p
                  role="alert"
                  className="mb-3 rounded-2xl bg-[#f8e3df] px-4 py-3 text-[14px] text-danger"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {formError}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              {!isNew && (
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  disabled={saving}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-danger transition-colors hover:bg-[#f8e3df] disabled:opacity-60"
                >
                  <Trash2 className="size-4" /> <span className="max-sm:sr-only">Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={requestClose}
                disabled={saving}
                className="ml-auto h-12 rounded-full px-5 text-[15px] font-medium ring-1 ring-line transition-colors hover:bg-canvas disabled:opacity-60"
              >
                Cancel
              </button>

              <motion.button
                type="submit"
                disabled={saving || uploading || (!isNew && !dirty)}
                className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-canvas transition-colors hover:bg-[#33312c] disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {saving ? 'Saving' : isNew ? 'Create product' : 'Save changes'}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.aside>

      <AnimatePresence>
        {confirmDiscard && (
          <ConfirmDialog
            title="Discard your changes?"
            confirmLabel="Discard"
            tone="danger"
            onConfirm={onClose}
            onCancel={() => setConfirmDiscard(false)}
          >
            <p>
              {isNew
                ? 'This product hasn’t been created yet.'
                : 'Your edits to this product haven’t been saved.'}
            </p>
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  )
}

function EditorSection({
  title,
  note,
  error,
  children,
}: {
  title: string
  note?: string
  error?: string
  children: ReactNode
}) {
  return (
    <section>
      <h3 className="font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">{title}</h3>
      {note && <p className="mt-1 text-[13px] text-ink-soft">{note}</p>}
      {error && (
        <p role="alert" className="mt-1 text-[13px] text-danger">
          {error}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function EditorField({
  label,
  error,
  hint,
  count,
  children,
}: {
  label: string
  error?: string
  hint?: string
  count?: [number, number]
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}) {
  const fieldId = useId()
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
  const overLimit = count && count[0] > count[1]

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={fieldId} className="text-[14px] font-medium">
          {label}
        </label>
        {count && count[0] > count[1] * 0.8 && (
          <span className={`text-[12px] tabular ${overLimit ? 'text-danger' : 'text-ink-soft'}`}>
            {count[1] - count[0]}
          </span>
        )}
      </div>

      {children({
        id: fieldId,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}

      {error ? (
        <p id={`${fieldId}-error`} className="mt-1 text-[13px] text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${fieldId}-hint`}
            aria-live="polite"
            className="mt-1 text-[13px] [overflow-wrap:anywhere] text-ink-soft"
          >
            {hint}
          </p>
        )
      )}
    </div>
  )
}

function VisibilityPicker({
  value,
  onChange,
}: {
  value: ProductStatus
  onChange: (next: ProductStatus) => void
}) {
  const options: { id: ProductStatus; label: string; note: string }[] = [
    { id: 'active', label: 'Live', note: 'Shoppers can see and buy it.' },
    { id: 'draft', label: 'Draft', note: 'Hidden from the store until you publish it.' },
  ]

  return (
    <fieldset>
      <legend className="mb-1.5 text-[14px] font-medium">Visibility</legend>
      <LayoutGroup id="status-picker">
        <div className="flex w-full rounded-full bg-canvas p-1 ring-1 ring-line">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={value === opt.id}
              onClick={() => onChange(opt.id)}
              className={`relative isolate h-10 flex-1 rounded-full text-[14px] font-medium transition-colors ${
                value === opt.id ? 'text-canvas' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {value === opt.id && (
                <motion.span
                  layoutId="status-picker-pill"
                  className={`absolute inset-0 -z-10 rounded-full ${
                    opt.id === 'active' ? 'bg-ok' : 'bg-ink'
                  }`}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </LayoutGroup>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        {options.find((o) => o.id === value)?.note}
      </p>
    </fieldset>
  )
}

function AddRowButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
    >
      <Plus className="size-4" /> {children}
    </button>
  )
}
