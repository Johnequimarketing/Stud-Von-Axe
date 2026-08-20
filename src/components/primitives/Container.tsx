import type { ReactNode } from 'react'
import styles from './Container.module.css'

interface ContainerProps {
  children: ReactNode
  /** 'prose' caps the measure at 68ch so lines stay in the 60 to 75ch band. */
  width?: 'max' | 'prose'
  className?: string
}

export function Container({ children, width = 'max', className }: ContainerProps) {
  return (
    <div
      className={[styles.container, styles[width], className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
