import { motion } from 'motion/react'
import type { Dispatch, SetStateAction } from 'react'

export function LiveToggle({
  live,
  setLive,
}: {
  live: boolean
  setLive: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={live}
      onClick={() => setLive((v) => !v)}
      className="flex w-full items-center justify-between rounded-2xl bg-canvas p-3 text-left"
    >
      <span>
        <span className="flex items-center gap-2 text-[14px] font-medium">
          <span className="relative grid size-2.5 place-items-center">
            {live && <span className="absolute size-2.5 animate-ping rounded-full bg-ok/60" />}
            <span className={`size-2 rounded-full ${live ? 'bg-ok' : 'bg-ink-faint'}`} />
          </span>
          Live traffic
        </span>
        <span className="mt-0.5 block text-[12px] text-ink-soft">
          {live ? 'Simulating shoppers' : 'Paused'}
        </span>
      </span>

      <span
        className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors duration-300 ${
          live ? 'justify-end bg-ok' : 'justify-start bg-line'
        }`}
      >
        <motion.span
          layout
          className="size-5 rounded-full bg-card shadow"
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
        />
      </span>
    </button>
  )
}
