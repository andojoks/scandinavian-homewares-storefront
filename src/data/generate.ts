import { PRODUCTS, type StarterProduct } from './catalog'

export type OrderStatus = 'paid' | 'packing' | 'shipped' | 'delivered'

export interface OrderItem {
  id: string
  name: string
  price: number
  qty: number
  finish?: string | null
}

export interface Order {
  id: string
  number: string
  uid?: string
  customer: string
  email: string
  city: string
  address?: string
  delivery?: string
  payment?: string
  items: OrderItem[]
  itemCount: number
  total: number
  status: OrderStatus
  createdAt: number
  simulated?: boolean
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES =
  'Astrid.Mateo.Noor.Elias.Freya.Kenji.Amara.Lukas.Ines.Theo.Sana.Oskar.Leila.Jonas.Maya.Rafael.Ida.Tariq.Clara.Henrik.Yara.Felix.Priya.Nils.Zoe.Arjun.Selma.Hugo.Aiko.Emil'.split(
    '.',
  )

const LAST_NAMES = [
  'Lund',
  'Okafor',
  'Haddad',
  'Berg',
  'Moreau',
  'Sato',
  'Novak',
  'Rahman',
  'Costa',
  'Fischer',
  'Lindqvist',
  'Mensah',
  'Duarte',
  'Holm',
  'Petrov',
  'Ahmed',
  'Nakamura',
  'Keller',
  'Silva',
  'Dahl',
]

export const CITIES = [
  'Copenhagen',
  'Oslo',
  'Stockholm',
  'Berlin',
  'Amsterdam',
  'London',
  'New York',
  'Toronto',
  'Melbourne',
  'Zürich',
  'Helsinki',
  'Lisbon',
]

const CITY_WEIGHTS = [16, 11, 12, 10, 8, 9, 7, 5, 4, 4, 3, 3]
const PRODUCT_WEIGHTS = [7, 9, 6, 5, 3, 10, 8, 9, 11]
const WEIGHT_BY_ID: Record<string, number> = Object.fromEntries(
  PRODUCTS.map((p, idx) => [p.id, PRODUCT_WEIGHTS[idx]]),
)

function pickWeighted<T>(rand: () => number, items: T[], weights?: number[]): T {
  if (!weights) return items[Math.floor(rand() * items.length)]
  const total = weights.reduce((acc, w) => acc + w, 0)
  let threshold = rand() * total
  for (let i = 0; i < items.length; i++) {
    threshold -= weights[i]
    if (threshold <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function makeOrder(
  rand: () => number,
  timestamp: number,
  overrides: Partial<Order> = {},
  pool: Pick<StarterProduct, 'id' | 'name' | 'price'>[] = PRODUCTS,
): Order {
  const lineCount = rand() < 0.62 ? 1 : rand() < 0.75 ? 2 : 3
  const weights = pool.map((p) => WEIGHT_BY_ID[p.id] ?? 7)
  const items: OrderItem[] = []

  for (let i = 0; i < lineCount; i++) {
    const product = pickWeighted(rand, pool, weights)
    const existing = items.find((item) => item.id === product.id)
    if (existing) {
      existing.qty += 1
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: product.price < 100 && rand() < 0.3 ? 2 : 1,
      })
    }
  }

  const first = pickWeighted(rand, FIRST_NAMES)
  const last = pickWeighted(rand, LAST_NAMES)
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return {
    id: `sim_${timestamp.toString(36)}_${Math.floor(rand() * 1_000_000).toString(36)}`,
    number: `KV-${Math.floor(10000 + rand() * 89999)}`,
    customer: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    city: pickWeighted(rand, CITIES, CITY_WEIGHTS),
    items,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    total,
    status: 'paid',
    createdAt: timestamp,
    ...overrides,
  }
}

const DAY_MS = 86_400_000

function statusForAge(ageMs: number, rand: () => number): OrderStatus {
  if (ageMs > 6 * DAY_MS) return 'delivered'
  if (ageMs > 2 * DAY_MS) return rand() < 0.7 ? 'delivered' : 'shipped'
  if (ageMs > 0.6 * DAY_MS) return rand() < 0.6 ? 'shipped' : 'packing'
  return rand() < 0.5 ? 'packing' : 'paid'
}

export function seedHistoricalOrders(now: number = Date.now(), days = 180): Order[] {
  const rand = mulberry32(20260409)
  const todayMidnight = new Date(now).setHours(0, 0, 0, 0)
  const orders: Order[] = []

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = todayMidnight - d * DAY_MS
    const weekday = new Date(dayStart).getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.35 : 1
    const growth = 1 + ((days - d) / days) * 0.55
    const count = Math.round((7 + rand() * 6) * growth * weekendBoost)

    for (let j = 0; j < count; j++) {
      const createdAt =
        dayStart +
        (7 + Math.floor(((rand() + rand() + rand()) / 3) * 17)) * 3_600_000 +
        Math.floor(rand() * 3_600_000)

      if (createdAt <= now) {
        orders.push(makeOrder(rand, createdAt, { status: statusForAge(now - createdAt, rand) }))
      }
    }
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt)
}
