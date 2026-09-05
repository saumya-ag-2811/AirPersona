import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Small numbered eyebrow used to label each scene. */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground',
        className,
      )}
    >
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-hairline" />
      {children}
    </div>
  )
}

/** Consistent section container with generous vertical rhythm. */
export function Section({
  id,
  children,
  className,
  as: Tag = 'section',
}: {
  id?: string
  children: ReactNode
  className?: string
  as?: 'section' | 'div'
}) {
  return (
    <Tag
      id={id}
      className={cn(
        'relative mx-auto w-full max-w-7xl px-6 py-24 scroll-mt-20 sm:py-32 lg:px-10',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
