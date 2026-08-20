import { copy } from '@/content'
import { CTALink } from '@/components/primitives'
import styles from './HeroParts.module.css'

/** The statement. One accent word, set in italic gold. */
export function HeroHeading({ className }: { className?: string }) {
  return (
    <h1 className={[styles.heading, className].filter(Boolean).join(' ')}>
      {copy.hero.headingBefore}{' '}
      <em className={styles.accent}>{copy.hero.headingAccent}</em>{' '}
      {copy.hero.headingAfter}
    </h1>
  )
}

export function HeroIntro({ className }: { className?: string }) {
  return (
    <p className={[styles.intro, className].filter(Boolean).join(' ')}>
      {copy.hero.intro}
    </p>
  )
}

export function HeroActions({
  className,
  onDark = true,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <div
      className={[styles.actions, onDark && styles.onDark, className]
        .filter(Boolean)
        .join(' ')}
    >
      <CTALink href="#available" variant="solid">
        {copy.hero.primaryCta}
      </CTALink>
      <CTALink href="#contact" variant="outline">
        {copy.hero.secondaryCta}
      </CTALink>
    </div>
  )
}
