import { copy, damlines } from '@/content'
import { shortName } from './parts'
import styles from './DamlineTabs.module.css'

/**
 * The numbered damline selector, shared by every variant of this round.
 *
 * Labels are the yard's short name for each dam so five of them fit on one
 * line beside the heading, which is what keeps the whole section inside a
 * screen. The full name is on the button for a screen reader and set large
 * in the panel, so nothing is lost by shortening the label.
 */
export function DamlineTabs({
  active,
  onSelect,
  className,
}: {
  active: number
  onSelect: (i: number) => void
  className?: string
}) {
  return (
    <div
      className={[styles.tabs, className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={copy.bloodlines.damlineSelectLabel}
    >
      {damlines.map((option, i) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          id={`damline-tab-${option.id}`}
          aria-selected={i === active}
          aria-controls={`damline-panel-${option.id}`}
          aria-label={option.dam}
          tabIndex={i === active ? 0 : -1}
          className={styles.tab}
          data-active={i === active ? 'true' : undefined}
          onClick={() => onSelect(i)}
          onKeyDown={(e) => {
            const n = damlines.length
            if (e.key === 'ArrowRight') onSelect((active + 1) % n)
            if (e.key === 'ArrowLeft') onSelect((active - 1 + n) % n)
          }}
        >
          <span className={styles.number} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className={styles.label}>{shortName(option)}</span>
        </button>
      ))}
    </div>
  )
}
