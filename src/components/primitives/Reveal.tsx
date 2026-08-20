import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface RevealProps {
  children: ReactNode
  /** Stagger within a group, in milliseconds. */
  delay?: number
  className?: string
}

/** Wraps content in the one-shot scroll reveal. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
