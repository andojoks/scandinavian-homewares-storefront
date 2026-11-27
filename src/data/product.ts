import {
  CATEGORIES,
  PRODUCTS,
  TINT_BG,
  type ProductFinish,
  type StarterProduct,
  type TintName,
} from './catalog'

export type ProductStatus = 'active' | 'draft'

export interface Product extends StarterProduct {
  status: ProductStatus
  position: number
  scene: string | null
  badge: string | null
  updatedAt?: number
}

export interface CategoryRecord {
  id: string
  name: string
  position?: number
  builtIn: boolean
  updatedAt?: number
}

export interface CustomCategoryInput {
  id: string
  name: string
  position: number
  updatedAt?: number
}

export interface FinishDraft extends ProductFinish {
  key: string
}

export interface DetailDraft {
  key: string
  text: string
}

export interface ProductDraft {
  name: string
  category: string
  price: string
  stock: string
  status: ProductStatus
  tint: TintName
  image: string
  scene: string
  badge: string
  blurb: string
  finishes: FinishDraft[]
  details: DetailDraft[]
  dimensions: string
  care: string
}

export interface ValidatedProductInput {
  name: string
  category: string
  price: number
  stock: number
  status: ProductStatus
  tint: TintName
  image: string
  scene: string | null
  badge: string | null
  blurb: string
  finishes: ProductFinish[]
  details: string[]
  dimensions: string
  care: string
}

export const LIMITS = {
  name: 60,
  category: 30,
  badge: 20,
  blurb: 300,
  text: 200,
  price: 100_000,
  stock: 100_000,
  finishes: 8,
  details: 12,
} as const

export { TINT_BG }

export const TINT_NAMES = Object.keys(TINT_BG) as TintName[]

export const STARTER_PRODUCTS: Product[] = PRODUCTS.map((p, index) => ({
  ...p,
  status: 'active',
  position: index,
  scene: p.scene ?? null,
  badge: p.badge ?? null,
}))

export const BUILT_IN_CATEGORIES: CategoryRecord[] = CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  builtIn: true,
}))

export const BUILT_IN_CATEGORY_IDS: string[] = BUILT_IN_CATEGORIES.map((c) => c.id)

export function sortCategories<T extends { position?: number; name: string }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name),
  )
}

export function normalizeCategoryName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1)
}

export function validateCategoryName(name: string): string | null {
  if (!name) return 'Name the category.'
  if (name.length > LIMITS.category) return `Keep it under ${LIMITS.category} characters.`
  return slugify(name) ? null : 'Use at least one letter or number.'
}

export function findDuplicateCategory<T extends { id: string; name: string }>(
  categories: T[],
  name: string,
  excludeId?: string,
): T | undefined {
  const lower = name.toLocaleLowerCase()
  return categories.find((c) => c.id !== excludeId && c.name.toLocaleLowerCase() === lower)
}

export function categoryLabel(
  categoryId: string,
  byId: Record<string, { name: string } | undefined>,
): string {
  return byId[categoryId]?.name ?? categoryId
}

export function sortProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/gi, 'o')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function uniqueSlug(name: string, existingIds: string[]): string {
  const taken = new Set(existingIds)
  const base = slugify(name) || 'product'
  let candidate = base
  for (let i = 2; taken.has(candidate); i++) {
    candidate = `${base}-${i}`
  }
  return candidate
}

const uid = () => crypto.randomUUID()

export function productToDraft(product?: Product | null): ProductDraft {
  if (!product) {
    return {
      name: '',
      category: 'seating',
      price: '',
      stock: '20',
      status: 'draft',
      tint: 'sand',
      image: '',
      scene: '',
      badge: '',
      blurb: '',
      finishes: [{ key: uid(), name: '', color: '#d8c4a4' }],
      details: [],
      dimensions: '',
      care: '',
    }
  }

  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    status: product.status,
    tint: product.tint,
    image: product.image,
    scene: product.scene ?? '',
    badge: product.badge ?? '',
    blurb: product.blurb,
    finishes: product.finishes.map((f) => ({ key: uid(), ...f })),
    details: product.details.map((text) => ({ key: uid(), text })),
    dimensions: product.dimensions,
    care: product.care,
  }
}

const DIGITS_RE = /^\d+$/
const HEX_RE = /^#[0-9a-f]{6}$/i

export function validateProductDraft(
  draft: ProductDraft,
  categoryIds: string[],
):
  { input: ValidatedProductInput; errors: null } | { input: null; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const name = draft.name.trim()
  const priceStr = draft.price.trim().replace(/^\$/, '')
  const stockStr = draft.stock.trim()

  if (!name) {
    errors.name = 'Give the product a name.'
  } else if (name.length > LIMITS.name) {
    errors.name = `Keep the name under ${LIMITS.name} characters.`
  }

  if (!new Set(categoryIds).has(draft.category)) {
    errors.category = 'Pick a category.'
  }

  if (!DIGITS_RE.test(priceStr) || Number(priceStr) < 1) {
    errors.price = 'Enter a price in whole dollars, like 129.'
  } else if (Number(priceStr) > LIMITS.price) {
    errors.price = `The price can’t be over $${LIMITS.price.toLocaleString('en-US')}.`
  }

  if (!DIGITS_RE.test(stockStr)) {
    errors.stock = 'Enter a whole number, 0 or more.'
  } else if (Number(stockStr) > LIMITS.stock) {
    errors.stock = `Stock can’t be over ${LIMITS.stock.toLocaleString('en-US')}.`
  }

  if (!TINT_NAMES.includes(draft.tint)) {
    errors.tint = 'Pick a background.'
  }

  if (!draft.image) {
    errors.image = 'Add a product image.'
  }

  if (draft.badge.trim().length > LIMITS.badge) {
    errors.badge = `Keep the badge under ${LIMITS.badge} characters.`
  }

  if (!draft.blurb.trim()) {
    errors.blurb = 'Write a short description.'
  } else if (draft.blurb.trim().length > LIMITS.blurb) {
    errors.blurb = `Keep the description under ${LIMITS.blurb} characters.`
  }

  if (draft.dimensions.trim().length > LIMITS.text) {
    errors.dimensions = `Keep this under ${LIMITS.text} characters.`
  }

  if (draft.care.trim().length > LIMITS.text) {
    errors.care = `Keep this under ${LIMITS.text} characters.`
  }

  if (draft.finishes.length === 0) {
    errors.finishes = 'Add at least one finish.'
  }

  const seenFinishes = new Set<string>()
  draft.finishes.forEach((finish, index) => {
    const fName = finish.name.trim()
    if (!fName) {
      errors[`finish-${index}`] = 'Name this finish.'
    } else if (fName.length > LIMITS.text) {
      errors[`finish-${index}`] = 'That name is too long.'
    } else if (seenFinishes.has(fName.toLowerCase())) {
      errors[`finish-${index}`] = 'Two finishes can’t share a name.'
    } else if (!HEX_RE.test(finish.color)) {
      errors[`finish-${index}`] = 'Pick a colour.'
    }
    seenFinishes.add(fName.toLowerCase())
  })

  draft.details.forEach((detail, index) => {
    if (detail.text.trim().length > LIMITS.text) {
      errors[`detail-${index}`] = 'That line is too long.'
    }
  })

  if (Object.keys(errors).length) {
    return { input: null, errors }
  }

  return {
    errors: null,
    input: {
      name,
      category: draft.category,
      price: Number(priceStr),
      stock: Number(stockStr),
      status: draft.status,
      tint: draft.tint,
      image: draft.image,
      scene: draft.scene || null,
      badge: draft.badge.trim() || null,
      blurb: draft.blurb.trim(),
      finishes: draft.finishes.map((f) => ({
        name: f.name.trim(),
        color: f.color.toLowerCase(),
      })),
      details: draft.details.map((d) => d.text.trim()).filter(Boolean),
      dimensions: draft.dimensions.trim(),
      care: draft.care.trim(),
    },
  }
}

export function draftsEqual(a: ProductDraft, b: ProductDraft): boolean {
  const serialize = (d: ProductDraft) =>
    JSON.stringify({
      ...d,
      finishes: d.finishes.map(({ name, color }) => [name, color]),
      details: d.details.map((item) => item.text),
    })
  return serialize(a) === serialize(b)
}
