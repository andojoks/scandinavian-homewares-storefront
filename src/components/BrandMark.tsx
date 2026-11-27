export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-display text-[22px] font-bold tracking-[-0.04em] ${className}`}
    >
      <span aria-hidden className="grid size-7 place-items-center rounded-full bg-ink text-canvas">
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M12 21V9M12 13l-4.5-4.5M12 11l4-4M8 21h8" />
        </svg>
      </span>
      KVIST
    </span>
  )
}
