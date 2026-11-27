import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: 'Shop',
    links: [
      ['Shop all', '/shop'],
      ['Seating', '/shop?c=seating'],
      ['Lighting', '/shop?c=lighting'],
      ['Textiles', '/shop?c=textiles'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Sign in', '/login'],
      ['Your orders', '/account'],
      ['Dashboard', '/dashboard'],
    ],
  },
]

export function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 pt-9 text-canvas sm:rounded-[32px] sm:px-12 sm:pt-14">
        <div className="grid gap-9 md:grid-cols-[1.4fr_2fr] md:gap-12">
          <div>
            <p className="max-w-sm font-display text-[1.6rem] leading-[1.1] font-semibold tracking-tight sm:text-3xl">
              Calm objects, made to be lived with.
            </p>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-canvas/70 sm:mt-4 sm:text-[15px]">
              Solid oak, wool and clay from small workshops in Denmark, Portugal and Lithuania.
              Dispatched in 48 hours.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[11px] tracking-[0.16em] text-canvas/60 uppercase">
                  {col.title}
                </p>
                <ul className="mt-2">
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      <Link
                        to={to}
                        viewTransition
                        className="group inline-flex min-h-9 items-center gap-1 text-[15px] text-canvas/85 transition-colors hover:text-canvas"
                      >
                        {label}
                        <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          aria-hidden
          className="mt-10 flex justify-between font-display text-[clamp(5rem,26vw,24rem)] leading-[0.78] font-bold tracking-[-0.06em] sm:mt-16"
          initial="hide"
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -5% 0px' }}
          transition={{ staggerChildren: 0.07 }}
        >
          {'KVIST'.split('').map((letter, idx) => (
            <span key={idx} className="inline-block overflow-hidden">
              <motion.span
                className="inline-block"
                variants={{ hide: { y: '100%' }, show: { y: '12%' } }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-canvas/15 py-4 text-[12px] text-canvas/60 sm:py-5 sm:text-[13px]">
          <span>© {new Date().getFullYear()} KVIST Home</span>
          <span>React · Tailwind · Firebase</span>
        </div>
      </div>
    </footer>
  )
}
