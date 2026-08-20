import type { Picture } from '@/sections/hero/images'
import styles from './IntroParts.module.css'

/** A framed photograph that lifts very slightly on hover. */
export function IntroFigure({
  picture,
  alt,
  caption,
  className,
  sizes = '(min-width: 900px) 50vw, 100vw',
  objectPosition,
}: {
  picture: Picture
  alt: string
  caption?: string
  className?: string
  sizes?: string
  objectPosition?: string
}) {
  return (
    <figure className={[styles.figure, className].filter(Boolean).join(' ')}>
      <div className={styles.media}>
        <picture>
          {Object.entries(picture.sources).map(([format, srcSet]) => (
            <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
          ))}
          <img
            className={styles.img}
            src={picture.img.src}
            width={picture.img.w}
            height={picture.img.h}
            alt={alt}
            style={objectPosition ? { objectPosition } : undefined}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
