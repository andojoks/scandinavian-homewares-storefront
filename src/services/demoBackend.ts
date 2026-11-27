import { seedHistoricalOrders, type Order, type OrderStatus } from '../data/generate'
import {
  BUILT_IN_CATEGORY_IDS,
  STARTER_PRODUCTS,
  type CustomCategoryInput,
  type Product,
} from '../data/product'
import { blobToDataUrl, resizeImageToWebp } from '../lib/image'
import { createOrderNumber, type AuthSnapshot, type AuthUser, type Backend } from './backend'

const KEYS = {
  users: 'kvist:users',
  session: 'kvist:session',
  orders: 'kvist:orders',
  status: 'kvist:status',
  products: 'kvist:products',
  categories: 'kvist:categories',
} as const

interface StoredUser extends AuthUser {
  hash: string
}

const DEMO_ADMIN: AuthUser = {
  uid: 'demo-admin',
  name: 'Demo Admin',
  email: 'demo@kvist.store',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage write errors in non-critical paths
  }
}

function writeStorageStrict(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw codedError('storage/quota-exceeded')
  }
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`kvist:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const codedError = (code: string) => Object.assign(new Error(code), { code })

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('kvist') : null

const authListeners = new Set<(snap: AuthSnapshot) => void>()
const orderListeners = new Set<{ uid?: string; onData: (orders: Order[]) => void }>()
const productListeners = new Set<{
  includeDrafts: boolean
  onData: (products: Product[]) => void
}>()
const categoryListeners = new Set<(categories: CustomCategoryInput[]) => void>()

const historicalOrders = seedHistoricalOrders()

function currentUser(): AuthUser | null {
  const uid = readStorage<string | null>(KEYS.session, null)
  if (!uid) return null
  if (uid === DEMO_ADMIN.uid) return DEMO_ADMIN
  const users = readStorage<Record<string, StoredUser>>(KEYS.users, {})
  const match = Object.values(users).find((u) => u.uid === uid)
  return match ? { uid: match.uid, name: match.name, email: match.email } : null
}

function emitAuth(): void {
  const user = currentUser()
  const snap: AuthSnapshot = { user, role: user ? 'admin' : null }
  authListeners.forEach((cb) => cb(snap))
}

function allOrders(): Order[] {
  const statusOverrides = readStorage<Record<string, OrderStatus>>(KEYS.status, {})
  const localOrders = readStorage<Order[]>(KEYS.orders, [])
  return [...localOrders, ...historicalOrders]
    .map((o) => (statusOverrides[o.id] ? { ...o, status: statusOverrides[o.id] } : o))
    .sort((a, b) => b.createdAt - a.createdAt)
}

function emitOrders(): void {
  const list = allOrders()
  orderListeners.forEach(({ uid, onData }) =>
    onData(uid ? list.filter((o) => o.uid === uid) : list),
  )
}

const readProducts = (): Product[] =>
  readStorage<Product[] | null>(KEYS.products, null) ?? STARTER_PRODUCTS

function emitProducts(): void {
  const list = readProducts()
  productListeners.forEach(({ includeDrafts, onData }) =>
    onData(includeDrafts ? list : list.filter((p) => p.status === 'active')),
  )
}

function saveProducts(next: Product[]): void {
  writeStorageStrict(KEYS.products, next)
  emitProducts()
  channel?.postMessage('products')
}

const readCategories = (): CustomCategoryInput[] =>
  readStorage<CustomCategoryInput[]>(KEYS.categories, [])

function emitCategories(): void {
  const list = readCategories()
  categoryListeners.forEach((cb) => cb(list))
}

function requireSignedIn(): void {
  if (!currentUser()) throw codedError('permission-denied')
}

channel?.addEventListener('message', (event) => {
  if (event.data === 'orders') emitOrders()
  if (event.data === 'auth') emitAuth()
  if (event.data === 'products') emitProducts()
  if (event.data === 'categories') emitCategories()
})

export const backend: Backend = {
  mode: 'demo',

  onAuthChange(cb) {
    authListeners.add(cb)
    queueMicrotask(() => {
      const user = currentUser()
      cb({ user, role: user ? 'admin' : null })
    })
    return () => {
      authListeners.delete(cb)
    }
  },

  async signIn(email, password) {
    await delay(650)
    const users = readStorage<Record<string, StoredUser>>(KEYS.users, {})
    const record = users[email.trim().toLowerCase()]
    if (!record || record.hash !== (await hashPassword(password))) {
      throw codedError('auth/invalid-credential')
    }
    writeStorage(KEYS.session, record.uid)
    emitAuth()
    channel?.postMessage('auth')
  },

  async signUp({ name, email, password }) {
    await delay(750)
    const normalized = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalized)) throw codedError('auth/invalid-email')
    if (password.length < 6) throw codedError('auth/weak-password')

    const users = readStorage<Record<string, StoredUser>>(KEYS.users, {})
    if (users[normalized]) throw codedError('auth/email-already-in-use')

    const uid = `u_${crypto.randomUUID().slice(0, 12)}`
    users[normalized] = {
      uid,
      name: name.trim(),
      email: normalized,
      hash: await hashPassword(password),
    }
    writeStorage(KEYS.users, users)
    writeStorage(KEYS.session, uid)
    emitAuth()
    channel?.postMessage('auth')
  },

  async demoSignIn() {
    await delay(450)
    writeStorage(KEYS.session, DEMO_ADMIN.uid)
    emitAuth()
    channel?.postMessage('auth')
  },

  async signOut() {
    localStorage.removeItem(KEYS.session)
    emitAuth()
    channel?.postMessage('auth')
  },

  async placeOrder({ user, items, total, shipping }) {
    await delay(900)
    const order: Order = {
      id: `o_${crypto.randomUUID().slice(0, 12)}`,
      number: createOrderNumber(),
      uid: user.uid,
      customer: shipping.name || user.name,
      email: user.email,
      city: shipping.city,
      address: shipping.address,
      delivery: shipping.delivery,
      payment: shipping.payment,
      items,
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      total,
      status: 'paid',
      createdAt: Date.now(),
    }
    writeStorage(KEYS.orders, [order, ...readStorage<Order[]>(KEYS.orders, [])])
    emitOrders()
    channel?.postMessage('orders')
    return order
  },

  subscribeOrders({ uid } = {}, onData) {
    const entry = { uid, onData }
    orderListeners.add(entry)
    queueMicrotask(() => {
      const list = allOrders()
      onData(uid ? list.filter((o) => o.uid === uid) : list)
    })
    return () => {
      orderListeners.delete(entry)
    }
  },

  async subscribe(email) {
    await delay(600)
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      throw codedError('auth/invalid-email')
    }
    const existing = readStorage<string[]>('kvist:subscribers', [])
    writeStorage('kvist:subscribers', [...new Set([...existing, email.trim().toLowerCase()])])
  },

  async updateOrderStatus(orderId, status) {
    const overrides = readStorage<Record<string, OrderStatus>>(KEYS.status, {})
    writeStorage(KEYS.status, { ...overrides, [orderId]: status })
    emitOrders()
    channel?.postMessage('orders')
  },

  subscribeProducts({ includeDrafts = false } = {}, onData) {
    const entry = { includeDrafts, onData }
    productListeners.add(entry)
    queueMicrotask(() => {
      const list = readProducts()
      onData(includeDrafts ? list : list.filter((p) => p.status === 'active'))
    })
    return () => {
      productListeners.delete(entry)
    }
  },

  async createProduct(product) {
    requireSignedIn()
    await delay(450)
    const list = readProducts()
    if (list.some((p) => p.id === product.id)) throw codedError('product/exists')
    saveProducts([...list, { ...product, updatedAt: Date.now() }])
  },

  async updateProduct(id, patch) {
    requireSignedIn()
    await delay(450)
    const list = readProducts()
    if (!list.some((p) => p.id === id)) throw codedError('not-found')
    saveProducts(list.map((p) => (p.id === id ? { ...p, ...patch, id, updatedAt: Date.now() } : p)))
  },

  async deleteProduct(id) {
    requireSignedIn()
    await delay(350)
    saveProducts(readProducts().filter((p) => p.id !== id))
  },

  async importStarterCatalog() {
    requireSignedIn()
    await delay(450)
    const existing = new Set(readProducts().map((p) => p.id))
    saveProducts([...readProducts(), ...STARTER_PRODUCTS.filter((p) => !existing.has(p.id))])
  },

  subscribeCategories(onData) {
    categoryListeners.add(onData)
    queueMicrotask(() => onData(readCategories()))
    return () => {
      categoryListeners.delete(onData)
    }
  },

  async createCategory(category) {
    requireSignedIn()
    await delay(300)
    const list = readCategories()
    if (BUILT_IN_CATEGORY_IDS.includes(category.id) || list.some((c) => c.id === category.id)) {
      throw codedError('category/exists')
    }
    writeStorageStrict(KEYS.categories, [...list, { ...category, updatedAt: Date.now() }])
    emitCategories()
    channel?.postMessage('categories')
  },

  async renameCategory(id, name) {
    requireSignedIn()
    await delay(300)
    const list = readCategories()
    if (!list.some((c) => c.id === id)) throw codedError('not-found')
    writeStorageStrict(
      KEYS.categories,
      list.map((c) => (c.id === id ? { ...c, name, updatedAt: Date.now() } : c)),
    )
    emitCategories()
    channel?.postMessage('categories')
  },

  async deleteCategory(id, moveToCategoryId) {
    requireSignedIn()
    await delay(400)
    if (BUILT_IN_CATEGORY_IDS.includes(id)) throw codedError('permission-denied')
    const products = readProducts()
    if (products.some((p) => p.category === id)) {
      if (!moveToCategoryId || moveToCategoryId === id) throw codedError('category/in-use')
      saveProducts(
        products.map((p) =>
          p.category === id ? { ...p, category: moveToCategoryId, updatedAt: Date.now() } : p,
        ),
      )
    }
    writeStorageStrict(
      KEYS.categories,
      readCategories().filter((c) => c.id !== id),
    )
    emitCategories()
    channel?.postMessage('categories')
  },

  async uploadProductImage(file) {
    requireSignedIn()
    const blob = await resizeImageToWebp(file, 800, 0.82)
    return blobToDataUrl(blob)
  },
}
