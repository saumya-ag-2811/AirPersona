'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Menu, X, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Environment', href: '#environment' },
  { label: 'Persona', href: '#persona' },
  { label: 'Risk', href: '#risk' },
  { label: 'Insights', href: '#insights' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-border bg-background/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a
          href="#top"
          onClick={go('#top')}
          className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="AirPersona — back to top"
        >
          <Wind className="h-5 w-5 text-accent transition-transform group-hover:rotate-12" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.28em]">
            AirPersona
          </span>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={go(item.href)}
                className="relative font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#persona"
              onClick={go('#persona')}
              className="rounded-full border border-accent/60 bg-accent/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/20"
            >
              Check yours
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="md:hidden text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={go(item.href)}
                    className="block py-3 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
