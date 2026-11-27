export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none'

export const btnPrimary = `${btnBase} bg-ink text-canvas hover:bg-[#33312c] h-12 px-6 text-[15px]`

export const btnSecondary = `${btnBase} bg-card text-ink ring-1 ring-line hover:ring-ink/30 h-12 px-6 text-[15px]`

export const pillTab =
  'relative isolate inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-300'

export const inputBase =
  'h-12 w-full rounded-2xl bg-canvas px-4 text-[15px] text-ink ring-1 ring-line outline-none transition-[box-shadow,background-color] duration-300 placeholder:text-ink-faint focus:bg-card focus:ring-2 focus:ring-ink'

export const eyebrow = 'font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft'
