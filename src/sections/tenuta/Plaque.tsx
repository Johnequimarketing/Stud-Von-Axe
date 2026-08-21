import styles from './Plaque.module.css'

/**
 * Direction C's repeating motif, tuned to Mark's own device: a short rule
 * above a wide-tracked uppercase label, with the section's index number in
 * accent ink ("01 · The stud"). Every section opens with one, which is
 * what makes nine different compositions read as one page.
 *
 * Elementor map: a heading widget with a border-top on its wrapper; the
 * build map carries the exact CSS.
 */
export function Plaque({
  children,
  index,
  tone = 'ink',
  className,
}: {
  children: string
  /** Section number in page order, rendered "01 ·" before the label. */
  index?: number
  /** 'ink' on light grounds, 'bone' over photographs and dark planes. */
  tone?: 'ink' | 'bone'
  className?: string
}) {
  return (
    <p className={[styles.plaque, styles[tone], className].filter(Boolean).join(' ')}>
      {/* The rule is the flex column's first row (the ::before), so the
          number and label share one row beneath it. */}
      <span className={styles.row}>
        {typeof index === 'number' ? (
          <span className={styles.index}>
            {String(index).padStart(2, '0')}
            <span aria-hidden="true"> · </span>
          </span>
        ) : null}
        {children}
      </span>
    </p>
  )
}
