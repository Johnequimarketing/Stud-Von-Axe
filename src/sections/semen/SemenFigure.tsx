import { semenDetail } from './images'
import styles from './SemenFigure.module.css'

/**
 * The section's one photograph. Ratio and radius come in as custom
 * properties rather than descendant selectors, because a selector written
 * in one CSS Module cannot reach a class hashed in another.
 */
export function SemenFigure({ className }: { className?: string }) {
  return (
    <div className={[styles.figure, className].filter(Boolean).join(' ')}>
      <picture>
        {Object.entries(semenDetail.sources).map(([format, srcSet]) => (
          <source
            key={format}
            type={`image/${format}`}
            srcSet={srcSet}
            sizes="(min-width: 1240px) 1240px, 100vw"
          />
        ))}
        <img
          src={semenDetail.img.src}
          width={semenDetail.img.w}
          height={semenDetail.img.h}
          /* A detail, not a horse: described as what it is, since naming a
             subject is exactly what this crop avoids. */
          alt="A plaited neck, presented in hand"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  )
}
