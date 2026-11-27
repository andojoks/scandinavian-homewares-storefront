import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Reveal } from './Reveal'
import { SplitHeading } from './SplitHeading'
import { eyebrow } from './ui'

export function SectionHeader({
  eyebrowText,
  title,
  link,
  tight = false,
  children,
}: {
  eyebrowText: string
  title: string
  link?: { to: string; label: string }
  tight?: boolean
  children?: ReactNode
}) {
  return (
    <div
      className={`mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-8 ${
        tight ? 'pt-1 sm:pt-4' : 'pt-14 sm:pt-28'
      }`}
    >
      <div>
        <Reveal as="p" className={eyebrow}>
          {eyebrowText}
        </Reveal>
        <h2 className="mt-2.5 display text-[clamp(2.15rem,5vw,4.5rem)] sm:mt-3">
          <SplitHeading text={title} inView />
        </h2>
      </div>
      {children}
      {link && (
        <Link
          to={link.to}
          viewTransition
          className="group inline-flex items-center gap-1.5 text-[15px] font-medium"
        >
          {link.label}
          <span className="grid size-9 place-items-center rounded-full bg-card shadow-tile transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="size-4" />
          </span>
        </Link>
      )}
    </div>
  )
}
