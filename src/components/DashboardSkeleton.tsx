export function DashboardSkeleton() {
  return (
    <div
      className="flex min-h-dvh gap-3 bg-canvas p-3"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="hidden w-60 shrink-0 animate-pulse rounded-[28px] bg-card lg:block" />
      <div className="grid flex-1 grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className={`animate-pulse rounded-[28px] bg-card ${
              idx === 4 ? 'col-span-3 row-span-2' : ''
            }`}
          />
        ))}
      </div>
    </div>
  )
}
