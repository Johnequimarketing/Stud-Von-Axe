import { copy } from '@/content'
import { Icon } from '@/components/primitives'
import type { IconName } from '@/components/primitives'
import styles from './FeatureBar.module.css'

/**
 * The feature bar: four audited facts on one paper card below the fold.
 */
export function FeatureBar() {
  const t = copy.cielo.arrival

  return (
    <ul className={styles.bar} role="list">
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
