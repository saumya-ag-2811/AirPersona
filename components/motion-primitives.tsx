'use client'

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Fade + translate reveal on scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const child: Variants = {
  hidden: { opacity: 0, y: '110%' },
  show: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

/**
 * Staggered line-by-line headline reveal.
 * Pass an array of lines; each animates up from a masked baseline.
 */
export function StaggerLines({
  lines,
  className,
  lineClassName,
  as = 'h2',
}: {
  lines: string[]
  className?: string
  lineClassName?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      variants={reduce ? undefined : container}
      initial={reduce ? undefined : 'hidden'}
      whileInView={reduce ? undefined : 'show'}
      viewport={{ once: true, margin: '-10% 0px' }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={cn('block', lineClassName)}
            variants={reduce ? undefined : child}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Count-up number that animates when scrolled into view. */
export function AnimatedNumber({
  value,
  decimals = 0,
  className,
  duration = 1.6,
}: {
  value: number
  decimals?: number
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const spring = useSpring(mv, {
    duration: duration * 1000,
    bounce: 0,
  })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      return
    }
    if (inView) mv.set(value)
  }, [inView, value, mv, reduce])

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(v))
  }, [spring])

  return (
    <span ref={ref} className={cn('tabular', className)}>
      {display.toFixed(decimals)}
    </span>
  )
}
