import styles from './Eyebrow.module.css'

interface EyebrowProps {
  children: string
  className?: string
}

/** Small tracked label above a section heading. */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={[styles.eyebrow, className].filter(Boolean).join(' ')}>
      {children}
    </p>
  )
}
