import { LoaderCircle, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useId, useState } from 'react'
import {
  type CategoryRecord,
  findDuplicateCategory,
  LIMITS,
  normalizeCategoryName,
  uniqueSlug,
  validateCategoryName,
} from '../../data/product'
import { friendlyCatalogError, getBackend } from '../../services/backend'
import { fieldInput } from './ConfirmDialog'

export function NewCategoryForm({
  categories,
  onDone,
  existingIsError = false,
  hint = 'It’s selected for this product and appears in the shop’s filters.',
  className = '',
}: {
  categories: CategoryRecord[]
  onDone: (id: string | null, message?: string) => void
  existingIsError?: boolean
  hint?: string
  className?: string
}) {
  const [rawName, setRawName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputId = useId()

  const submit = async () => {
    if (busy) return
    const name = normalizeCategoryName(rawName)
    const validationErr = validateCategoryName(name)
    if (validationErr) {
      setError(validationErr)
      return
    }
    const existing = findDuplicateCategory(categories, name)
    if (existing) {
      if (existingIsError) {
        setError(`${existing.name} already exists.`)
      } else {
        onDone(existing.id, `${existing.name} already exists, so it’s selected.`)
      }
      return
    }

    setBusy(true)
    setError('')
    const id = uniqueSlug(
      name,
      categories.map((c) => c.id),
    )
    try {
      const position = Math.max(-1, ...categories.map((c) => c.position ?? -1)) + 1
      const backend = await getBackend()
      await backend.createCategory({ id, name, position })
      onDone(id, `${name} was added. It shows in the shop once a live product uses it.`)
    } catch (err) {
      setError(friendlyCatalogError(err))
      setBusy(false)
    }
  }

  return (
    <motion.div
      className={`-m-px overflow-hidden p-px ${className}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl bg-canvas p-3 ring-1 ring-line sm:p-4">
        <label htmlFor={inputId} className="text-[14px] font-medium">
          New category
        </label>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            autoFocus
            value={rawName}
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
                e.stopPropagation()
                onDone(null)
              }
            }}
            maxLength={LIMITS.category + 10}
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
            className={`${fieldInput} bg-card`}
            placeholder="e.g. Rugs"
            autoComplete="off"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDone(null)}
              disabled={busy}
              className="h-11 flex-1 rounded-full px-4 text-[14px] font-medium ring-1 ring-line transition-colors hover:bg-card disabled:opacity-60 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-5 text-[14px] font-medium text-canvas transition-colors hover:bg-[#33312c] disabled:opacity-60 sm:flex-none"
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </button>
          </div>
        </div>

        {error ? (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-[13px] text-danger">
            {error}
          </p>
        ) : (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-ink-soft">
            {hint}
          </p>
        )}
      </div>
    </motion.div>
  )
}
