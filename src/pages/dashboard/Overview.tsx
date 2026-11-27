import { DollarSign, ReceiptText, ShoppingCart, Users } from 'lucide-react'
import { LayoutGroup, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { SplitHeading } from '../../components/SplitHeading'
import { useAuth } from '../../context/AuthContext'
import { formatDate, int, money, moneyCents, timeAgo } from '../../lib/format'
import {
  categoryShare,
  computeKpis,
  dailySeries,
  inventoryAllocation,
  ordersInWindow,
  todayStats,
  topProducts,
} from '../../lib/metrics'
import { useDashboardContext } from './DashboardLayout'
import { CategoryDonut } from './widgets/CategoryDonut'
import { InventoryWidget } from './widgets/InventoryWidget'
import { KpiCard } from './widgets/KpiCard'
import { LiveFeed } from './widgets/LiveFeed'
import { RevenueChart } from './widgets/RevenueChart'
import { TodayGoal } from './widgets/TodayGoal'
import { TopProducts } from './widgets/TopProducts'

const RANGE_OPTIONS = [7, 30, 90] as const
const DAILY_GOAL = 4000

export default function Overview() {
  const { orders, fresh, live, now, error, catalog } = useDashboardContext()
  const { user } = useAuth()
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(30)

  const minuteBucket = Math.floor(now / 60_000) * 60_000
  const referenceNow = Math.max(minuteBucket, orders[0]?.createdAt ?? 0)

  const hour = new Date(now).getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = useMemo(() => {
    const windowOrders = ordersInWindow(orders, range, referenceNow)
    const series = dailySeries(orders, range, referenceNow)
    const kpi = computeKpis(orders, range, referenceNow)

    return {
      kpi,
      series,
      spark: {
        revenue: series.map((pt) => pt.revenue),
        orders: series.map((pt) => pt.orders),
        aov: series.map((pt) => (pt.orders ? pt.revenue / pt.orders : 0)),
        customers: series.map((pt) => pt.customers),
      },
      top: topProducts(windowOrders, catalog.byId, 5),
      share: categoryShare(windowOrders, catalog.byId),
      today: todayStats(orders, referenceNow),
      stock: inventoryAllocation(orders, referenceNow, catalog.products),
    }
  }, [orders, range, referenceNow, catalog.byId, catalog.products])

  return (
    <div className="space-y-3 sm:space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 px-1 pt-1 pb-1 sm:gap-4 lg:pt-3">
        <div>
          <p className="text-[14px] text-ink-soft">
            {formatDate(now, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-1 display text-[clamp(2.2rem,3.6vw,3.25rem)]">
            <SplitHeading text={`${greeting}, ${user?.name?.split(' ')[0] ?? 'there'}`} />
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-[13px] text-ink-soft sm:inline">
            Last order {orders[0] ? timeAgo(orders[0].createdAt, now) : '—'}
          </span>

          <LayoutGroup id="range">
            <div
              className="flex rounded-full bg-card p-1 shadow-tile"
              role="tablist"
              aria-label="Date range"
            >
              {RANGE_OPTIONS.map((days) => (
                <button
                  key={days}
                  role="tab"
                  aria-selected={range === days}
                  onClick={() => setRange(days)}
                  className={`relative isolate h-10 rounded-full px-4 text-[13px] font-medium transition-colors ${
                    range === days ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {range === days && (
                    <motion.span
                      layoutId="range-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  {days}D
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl bg-[#f8e3df] px-4 py-3 text-[14px] text-danger">
          Couldn’t load orders:{' '}
          {error.code === 'permission-denied'
            ? 'this account isn’t an admin in Firestore.'
            : error.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          i={0}
          label="Revenue"
          icon={DollarSign}
          value={stats.kpi.revenue.value}
          delta={stats.kpi.revenue.delta}
          format={money}
          series={stats.spark.revenue}
        />
        <KpiCard
          i={1}
          label="Orders"
          icon={ShoppingCart}
          value={stats.kpi.orders.value}
          delta={stats.kpi.orders.delta}
          format={int}
          series={stats.spark.orders}
        />
        <KpiCard
          i={2}
          label="Avg. order value"
          icon={ReceiptText}
          value={stats.kpi.aov.value}
          delta={stats.kpi.aov.delta}
          format={moneyCents}
          series={stats.spark.aov}
        />
        <KpiCard
          i={3}
          label="Customers"
          icon={Users}
          value={stats.kpi.customers.value}
          delta={stats.kpi.customers.delta}
          format={int}
          series={stats.spark.customers}
        />
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-12">
        <div className="grid gap-3 sm:gap-4 xl:col-span-8">
          <RevenueChart
            i={4}
            series={stats.series}
            range={range}
            live={live}
            className="min-h-[380px]"
          />
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <TodayGoal i={5} today={stats.today} goal={DAILY_GOAL} now={now} />
            <CategoryDonut i={6} data={stats.share} />
          </div>
        </div>

        <LiveFeed
          i={7}
          orders={orders}
          fresh={fresh}
          now={now}
          live={live}
          className="xl:col-span-4"
        />
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-12">
        <TopProducts i={8} items={stats.top} className="xl:col-span-5" />
        <InventoryWidget i={9} items={stats.stock} className="xl:col-span-7" />
      </div>
    </div>
  )
}
