import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id?: string
  children: ReactNode
  /** 'surface' is the single tinted band. 'inverse' is the footer and the
      embryo section, which is the page's one dark band: keep it to those
      two, and never put long body copy on it. */
  tone?: 'base' | 'surface' | 'inverse'
  /** Full-bleed sections opt out of the container themselves. */
  flush?: boolean
  labelledBy?: string
  className?: string
  /** Lets the footer render as a real contentinfo landmark. */
  as?: 'section' | 'footer'
}

export function Section({
  id,
  children,
  tone = 'base',
  flush = false,
  labelledBy,
  className,
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      data-theme={tone === 'inverse' ? 'inverse' : undefined}
      className={[styles.section, styles[tone], flush && styles.flush, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
