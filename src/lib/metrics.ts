import { CATEGORIES } from '../data/catalog'
import type { Order } from '../data/generate'
import type { Product } from '../data/product'

const DAY_MS = 86_400_000
const midnight = (t: number) => new Date(t).setHours(0, 0, 0, 0)

export interface DailySeriesPoint {
  date: number
  revenue: number
  orders: number
  customers: number
}

export interface KpiStat {
  value: number
  delta: number
}

export interface KpiGroup {
  revenue: KpiStat
  orders: KpiStat
  aov: KpiStat
  customers: KpiStat
}

export interface TopProductEntry {
  product: Product
  units: number
  revenue: number
}

export interface CategoryShareEntry {
  id: string
  name: string
  value: number
  share: number
}

export interface TodayStats {
  orders: number
  revenue: number
  hours: number[]
}

export interface StockRow {
  product: Product
  onHand: number
  ratio: number
  low: boolean
}

export function ordersInWindow(
  orders: Order[],
  days: number,
  now: number,
  offsetPeriods = 0,
): Order[] {
  const end = midnight(now) + DAY_MS - offsetPeriods * days * DAY_MS
  const start = end - days * DAY_MS
  return orders.filter((o) => o.createdAt >= start && o.createdAt < end && o.createdAt <= now)
}

export function dailySeries(orders: Order[], days: number, now: number): DailySeriesPoint[] {
  const start = midnight(now) - (days - 1) * DAY_MS
  const buckets = Array.from({ length: days }, (_, idx) => ({
    date: start + idx * DAY_MS,
    revenue: 0,
    orders: 0,
    customers: new Set<string>(),
  }))

  for (const order of orders) {
    const idx = Math.floor((order.createdAt - start) / DAY_MS)
    if (idx >= 0 && idx < days) {
      buckets[idx].revenue += order.total
      buckets[idx].orders += 1
      buckets[idx].customers.add(order.email)
    }
  }

  return buckets.map((b) => ({
    date: b.date,
    revenue: b.revenue,
    orders: b.orders,
    customers: b.customers.size,
  }))
}

function summarize(orders: Order[]) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  const customers = new Set(orders.map((o) => o.email)).size
  return {
    revenue,
    orders: orders.length,
    aov: orders.length ? revenue / orders.length : 0,
    customers,
  }
}

const deltaPct = (current: number, previous: number) =>
  previous ? ((current - previous) / previous) * 100 : current ? 100 : 0

export function computeKpis(orders: Order[], days: number, now: number): KpiGroup {
  const current = summarize(ordersInWindow(orders, days, now, 0))
  const previous = summarize(ordersInWindow(orders, days, now, 1))
  return {
    revenue: { value: current.revenue, delta: deltaPct(current.revenue, previous.revenue) },
    orders: { value: current.orders, delta: deltaPct(current.orders, previous.orders) },
    aov: { value: current.aov, delta: deltaPct(current.aov, previous.aov) },
    customers: { value: current.customers, delta: deltaPct(current.customers, previous.customers) },
  }
}

export function topProducts(
  orders: Order[],
  byId: Record<string, Product | undefined>,
  limit = 5,
): TopProductEntry[] {
  const units: Record<string, number> = {}
  const revenue: Record<string, number> = {}

  for (const order of orders) {
    for (const item of order.items) {
      units[item.id] = (units[item.id] || 0) + item.qty
      revenue[item.id] = (revenue[item.id] || 0) + item.qty * item.price
    }
  }

  return Object.keys(revenue)
    .filter((id) => byId[id])
    .map((id) => ({ product: byId[id]!, units: units[id], revenue: revenue[id] }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function categoryShare(
  orders: Order[],
  byId: Record<string, Product | undefined>,
): CategoryShareEntry[] {
  const totals: Record<string, number> = Object.fromEntries([
    ...CATEGORIES.map((c) => [c.id, 0]),
    ['other', 0],
  ])

  for (const order of orders) {
    for (const item of order.items) {
      const cat = byId[item.id]?.category
      if (cat) {
        totals[cat in totals ? cat : 'other'] += item.qty * item.price
      }
    }
  }

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0) || 1
  const cats = totals.other
    ? [...CATEGORIES, { id: 'other', name: 'Other' }]
    : CATEGORIES.map((c) => ({ id: c.id, name: c.name }))

  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    value: totals[c.id],
    share: totals[c.id] / grandTotal,
  }))
}

export function todayStats(orders: Order[], now: number): TodayStats {
  const todays = ordersInWindow(orders, 1, now)
  const revenue = todays.reduce((sum, o) => sum + o.total, 0)
  const hours = Array.from({ length: 24 }, () => 0)
  for (const order of todays) {
    hours[new Date(order.createdAt).getHours()] += 1
  }
  return { orders: todays.length, revenue, hours }
}

export function inventoryAllocation(orders: Order[], now: number, products: Product[]): StockRow[] {
  const cutoff = now - 7 * DAY_MS
  const sold: Record<string, number> = {}

  for (const order of orders) {
    if (order.createdAt >= cutoff && order.createdAt <= now) {
      for (const item of order.items) {
        sold[item.id] = (sold[item.id] || 0) + item.qty
      }
    }
  }

  return products
    .map((product) => {
      const onHand = Math.max(0, product.stock - (sold[product.id] || 0))
      const ratio = product.stock ? onHand / product.stock : 0
      return { product, onHand, ratio, low: ratio < 0.25 }
    })
    .sort((a, b) => a.ratio - b.ratio)
}
