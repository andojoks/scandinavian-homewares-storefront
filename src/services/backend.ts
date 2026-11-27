import type { Order, OrderItem, OrderStatus } from '../data/generate'
import type { CustomCategoryInput, Product, ValidatedProductInput } from '../data/product'

export interface AuthUser {
  uid: string
  name: string
  email: string
}

export interface AuthSnapshot {
  user: AuthUser | null
  role: 'admin' | null
}

export interface ShippingDetails {
  name: string
  address: string
  city: string
  delivery: string
  payment: string
}

export interface PlaceOrderInput {
  user: AuthUser
  items: OrderItem[]
  total: number
  shipping: ShippingDetails
}

export interface Backend {
  mode: 'demo' | 'firebase'
  onAuthChange(cb: (snap: AuthSnapshot) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signUp(input: { name: string; email: string; password: string }): Promise<void>
  signInWithGoogle?(): Promise<void>
  demoSignIn(): Promise<void>
  signOut(): Promise<void>
  placeOrder(input: PlaceOrderInput): Promise<Order>
  subscribeOrders(
    opts: { uid?: string },
    onData: (orders: Order[]) => void,
    onError?: (err: Error & { code?: string }) => void,
  ): () => void
  subscribe(email: string): Promise<void>
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>
  subscribeProducts(
    opts: { includeDrafts?: boolean },
    onData: (products: Product[]) => void,
    onError?: (err: Error & { code?: string }) => void,
  ): () => void
  createProduct(product: Product): Promise<void>
  updateProduct(id: string, patch: Partial<ValidatedProductInput>): Promise<void>
  deleteProduct(id: string): Promise<void>
  importStarterCatalog(): Promise<void>
  subscribeCategories(
    onData: (categories: CustomCategoryInput[]) => void,
    onError?: (err: Error & { code?: string }) => void,
  ): () => void
  createCategory(category: CustomCategoryInput): Promise<void>
  renameCategory(id: string, name: string): Promise<void>
  deleteCategory(id: string, moveToCategoryId: string | null): Promise<void>
  uploadProductImage(file: File): Promise<string>
}

export const HAS_FIREBASE = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID,
)

export const HAS_STORAGE_UPLOAD =
  !HAS_FIREBASE || Boolean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)

let backendPromise: Promise<Backend> | undefined

export function getBackend(): Promise<Backend> {
  backendPromise ??= HAS_FIREBASE
    ? import('./firebaseBackend').then((m) => m.backend)
    : import('./demoBackend').then((m) => m.backend)
  return backendPromise
}

export const ORDER_STATUSES: OrderStatus[] = ['paid', 'packing', 'shipped', 'delivered']

export function createOrderNumber(): string {
  return `KV-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 10)}`
}

export function friendlyAuthError(err: unknown): string {
  const e = err as { code?: string; message?: string } | null
  const msg = e?.code || e?.message || ''
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(msg)) {
    return 'That email and password don’t match an account.'
  }
  if (/email-already-in-use/.test(msg)) {
    return 'An account with this email already exists. Try signing in.'
  }
  if (/weak-password/.test(msg)) {
    return 'Use at least 6 characters for your password.'
  }
  if (/invalid-email/.test(msg)) {
    return 'That doesn’t look like an email address.'
  }
  if (/too-many-requests/.test(msg)) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  if (/popup-closed/.test(msg)) {
    return 'The Google window was closed before signing in.'
  }
  if (/network/.test(msg)) {
    return 'You seem to be offline. Check your connection.'
  }
  return 'Something went wrong. Please try again.'
}

export function friendlyCatalogError(err: unknown): string {
  const e = err as { code?: string; message?: string } | null
  const msg = e?.code || e?.message || ''
  if (/product\/exists/.test(msg)) {
    return 'A product with this name already exists. Change the name a little.'
  }
  if (/category\/exists/.test(msg)) {
    return 'That category already exists.'
  }
  if (/category\/in-use/.test(msg)) {
    return 'Products still use this category. Pick where they should move.'
  }
  if (/permission-denied|unauthorized/.test(msg)) {
    return 'This account can’t edit products. Ask an owner to make you an admin.'
  }
  if (/not-found/.test(msg)) {
    return 'This product was deleted somewhere else.'
  }
  if (/no-bucket/.test(msg)) {
    return 'Image uploads need Cloud Storage. Set VITE_FIREBASE_STORAGE_BUCKET, or pick a built-in image.'
  }
  if (/quota|resource-exhausted/.test(msg)) {
    return 'Storage is full. Use a smaller image or remove an uploaded one.'
  }
  if (/unavailable|network|offline/.test(msg)) {
    return 'You seem to be offline. Check your connection and try again.'
  }
  return 'That didn’t save. Please try again.'
}
