import type { LiveResult } from '@/content'
import { copy } from '@/content'
import styles from './ResultCard.module.css'

/** 1st, 2nd, 3rd, 4th ... 21st. Typeset with the ordinal as a superscript. */
function ordinalSuffix(n: number) {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (n % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

/** Feed dates arrive as ISO. Anything unparseable is dropped rather than
    printed raw, since a broken date is worse than no date. */
function formatDate(iso?: string) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * One result from the feed.
 *
 * Every field below the horse's name is optional, and each renders only if
 * the feed carried it. That is deliberate: the mockup showed "with [rider]"
 * as a placeholder, and a placeholder in production reads as a bug.
 */
export function ResultCard({ result }: { result: LiveResult }) {
  const date = formatDate(result.date)
  const line = [result.venue, result.className].filter(Boolean).join(' · ')

  return (
    <li className={styles.card}>
      <div className={styles.top}>
        <p className={styles.placing}>
          {result.placing}
          <span className={styles.ordinal}>
            {ordinalSuffix(result.placing)}
          </span>
        </p>
        {result.country ? (
          <p className={styles.country}>{result.country}</p>
        ) : null}
      </div>

      <div className={styles.identity}>
        {date ? <p className={styles.date}>{date}</p> : null}
        <h3 className={styles.horse}>{result.horse}</h3>
        {result.sire ? (
          <p className={styles.sire}>
            {copy.proof.by} {result.sire}
          </p>
        ) : null}
      </div>

      {line || result.score || result.rider ? (
        <div className={styles.detail}>
          {line ? <p className={styles.class}>{line}</p> : null}
          {result.score ? <p className={styles.score}>{result.score}</p> : null}
          {result.rider ? (
            <p className={styles.rider}>
              <span className={styles.with}>{copy.proof.with}</span>{' '}
              {result.rider}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
