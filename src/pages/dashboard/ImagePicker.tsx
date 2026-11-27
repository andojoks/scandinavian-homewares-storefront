import { Check, ImageUp, LoaderCircle } from 'lucide-react'
import { useId } from 'react'
import { imageAsset } from '../../lib/asset'
import { IMAGE_ACCEPT } from '../../lib/image'
import { HAS_STORAGE_UPLOAD } from '../../services/backend'

export const BUILT_IN_CUTOUTS = [
  'chair',
  'lamp',
  'pendant',
  'stool',
  'table',
  'throw',
  'vase',
  'bowl',
  'cushion',
].map((name) => imageAsset(`${name}.webp`))

export const BUILT_IN_SCENES = [
  'best-chair',
  'best-lamp',
  'best-throw',
  'interior',
  'feature-detail',
  'feature-room',
].map((name) => imageAsset(`${name}.jpg`))

export function ImagePicker({
  value,
  error,
  uploading,
  onPick,
  onUpload,
}: {
  value: string
  error?: string
  uploading: boolean
  onPick: (src: string) => void
  onUpload: (file?: File) => void
}) {
  const inputId = useId()
  const uploadedCustom = value && !BUILT_IN_CUTOUTS.includes(value) ? value : null

  return (
    <fieldset>
      <legend className="text-[14px] font-medium">
        Product image{' '}
        <span className="font-normal text-ink-soft">
          · a cut-out on a transparent background looks best
        </span>
      </legend>

      <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
        <label
          htmlFor={inputId}
          className={`grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-[12px] font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
            HAS_STORAGE_UPLOAD ? '' : 'pointer-events-none opacity-50'
          }`}
        >
          {uploading ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <span className="grid justify-items-center gap-1">
              <ImageUp className="size-5" />
              Upload
            </span>
          )}
          <input
            id={inputId}
            type="file"
            accept={IMAGE_ACCEPT}
            disabled={!HAS_STORAGE_UPLOAD || uploading}
            className="sr-only"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onChange={(e) => {
              onUpload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>

        {uploadedCustom && (
          <ImageChoice
            src={uploadedCustom}
            selected
            label="Uploaded image"
            onClick={() => onPick(uploadedCustom)}
          />
        )}

        {BUILT_IN_CUTOUTS.map((src) => (
          <ImageChoice
            key={src}
            src={src}
            selected={value === src}
            label={`Built-in image ${src.split('/').pop()}`}
            onClick={() => onPick(src)}
          />
        ))}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : (
        !HAS_STORAGE_UPLOAD && (
          <p className="mt-1.5 text-[13px] text-ink-soft">
            Uploads need Cloud Storage: set VITE_FIREBASE_STORAGE_BUCKET. Built-in images work
            without it.
          </p>
        )
      )}
    </fieldset>
  )
}

function ImageChoice({
  src,
  selected,
  label,
  onClick,
}: {
  src: string
  selected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={`relative grid aspect-square place-items-center rounded-xl bg-canvas ring-1 ring-line ${
        selected ? 'ring-2 ring-ink' : ''
      }`}
    >
      <img src={src} alt="" loading="lazy" className="size-[78%] object-contain" />
      {selected && (
        <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-ink text-canvas">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}
