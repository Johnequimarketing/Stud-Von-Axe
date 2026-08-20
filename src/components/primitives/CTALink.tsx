import type { ReactNode } from 'react'
import styles from './CTALink.module.css'

interface CTALinkProps {
  href: string
  children: ReactNode
  /** 'solid' is the single primary action; 'text' is everything else. */
  variant?: 'solid' | 'outline' | 'text'
  external?: boolean
  className?: string
  ariaLabel?: string
}

export function CTALink({
  href,
  children,
  variant = 'text',
  external = false,
  className,
  ariaLabel,
}: CTALinkProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={[styles.cta, styles[variant], className].filter(Boolean).join(' ')}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.arrow} aria-hidden="true">
        {external ? '↗' : '→'}
      </span>
    </a>
  )
}
