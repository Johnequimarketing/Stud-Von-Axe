import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  id?: string
  text: string
  /** Substring of `text` set in gold italic, echoing the hero's accent
      word. First occurrence wins. */
  accent?: string
  className?: string
}

/** Every section headline: one size token, one accent treatment. */
export function SectionHeading({ id, text, accent, className }: SectionHeadingProps) {
  const classes = [styles.heading, className].filter(Boolean).join(' ')
  const at = accent ? text.indexOf(accent) : -1

  if (!accent || at === -1) {
    return (
      <h2 id={id} className={classes}>
        {text}
      </h2>
    )
  }

  return (
    <h2 id={id} className={classes}>
      {text.slice(0, at)}
      <em className={styles.accent}>{accent}</em>
      {text.slice(at + accent.length)}
    </h2>
  )
}
