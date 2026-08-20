import styles from './Pedigree.module.css'

interface PedigreeProps {
  /** Ancestors in generation order. */
  pedigree: string[]
  /** Display scale. 'lead' is used for the featured horse and hero. */
  size?: 'meta' | 'body' | 'lead'
  className?: string
}

/**
 * Renders a genetics line so it breaks only *between* generations and never
 * inside a horse's name. Each ancestor is a nowrap span; the gold separators
 * are the only permitted break points.
 */
export function Pedigree({ pedigree, size = 'body', className }: PedigreeProps) {
  return (
    <p
      className={[styles.pedigree, styles[size], className]
        .filter(Boolean)
        .join(' ')}
    >
      {pedigree.map((ancestor, i) => (
        <span key={`${ancestor}-${i}`} className={styles.group}>
          {i > 0 && (
            <>
              {/* JSX strips the whitespace between these spans, so without
                  an explicit break opportunity the whole line is one
                  unbreakable run and overflows narrow screens. */}
              <wbr />
              <span className={styles.separator} aria-hidden="true">
                ×
              </span>
            </>
          )}
          <span className={styles.name}>{ancestor}</span>
        </span>
      ))}
    </p>
  )
}
