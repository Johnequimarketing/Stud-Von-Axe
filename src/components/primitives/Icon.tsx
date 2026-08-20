import styles from './Icon.module.css'

/**
 * Small line icons, drawn here rather than pulled from a set.
 *
 * The brief asks for a minimal line style paired always with a label, never
 * decorating a headline. They inherit `currentColor` and share one stroke
 * weight and one 24 unit grid, so they read as one family and can never
 * drift the way a mixed icon set does.
 */
export type IconName = 'frozen' | 'laboratory' | 'export' | 'node'

const PATHS: Record<IconName, JSX.Element> = {
  /* Frozen: three crossing strokes. The first draft added tick marks at
     each point to make it more snowflake-like and it just read as clutter
     at 22px, so the spokes carry it alone. */
  frozen: (
    <>
      <path d="M12 3.5v17" />
      <path d="M4.6 7.75l14.8 8.5" />
      <path d="M19.4 7.75L4.6 16.25" />
    </>
  ),
  /* Laboratory: a vial, the form semen actually ships in. Drawn wide: the
     first draft was four units across and read as a thermometer. */
  laboratory: (
    <>
      <path d="M9 3.2h6" />
      <path d="M9.6 3.2v11.9a2.4 2.4 0 004.8 0V3.2" />
      <path d="M9.6 10.8h4.8" />
    </>
  ),
  /* Export: a globe, for the EU and beyond rather than a courier box. */
  export: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.3 2.3 3.5 5.3 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.3-3.5-8.5S9.7 5.8 12 3.5z" />
    </>
  ),
  /* The house node: the same mark the pedigree separators use. */
  node: (
    <>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 3v6.4M12 14.6V21" />
    </>
  ),
}

export function Icon({
  name,
  className,
  size = 20,
}: {
  name: IconName
  className?: string
  size?: number
}) {
  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      /* Decorative: every icon here sits beside its own text label. */
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
