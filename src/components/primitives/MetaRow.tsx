import styles from './MetaRow.module.css'

export interface MetaItem {
  label: string
  value: string
}

interface MetaRowProps {
  /* Readonly, because copy is declared `as const` and its spec arrays are
     passed straight in. */
  items: readonly MetaItem[]
  className?: string
}

/** Label/value pairs for horse specifications. */
export function MetaRow({ items, className }: MetaRowProps) {
  return (
    <dl className={[styles.row, className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <div key={item.label} className={styles.pair}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
