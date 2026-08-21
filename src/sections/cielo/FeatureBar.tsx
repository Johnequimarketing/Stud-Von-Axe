import { copy } from '@/content'
import { Icon } from '@/components/primitives'
import type { IconName } from '@/components/primitives'
import styles from './FeatureBar.module.css'

/**
 * The frosted glass feature bar: four audited facts on the fold's glass.
 * Extracted so every hero concept carries the identical bar rather than
 * three drifting copies.
 */
export function FeatureBar({ inset = false }: { inset?: boolean }) {
  const t = copy.cielo.arrival

  return (
    <ul className={styles.bar} data-inset={inset ? 'true' : undefined} role="list">
      {t.features.map((f) => (
        <li key={f.title} className={styles.feature}>
          <span className={styles.featureIcon} aria-hidden="true">
            <Icon name={f.icon as IconName} size={20} />
          </span>
          <span className={styles.featureText}>
            <span className={styles.featureTitle}>{f.title}</span>
            <span className={styles.featureLine}>{f.text}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
