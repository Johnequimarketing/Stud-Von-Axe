import type { Picture } from './images'
import styles from './HeroImage.module.css'

interface HeroImageProps {
  picture: Picture
  alt: string
  className?: string
  /** The hero image is the LCP element, so it never lazy-loads. */
  priority?: boolean
  sizes?: string
  objectPosition?: string
}

export function HeroImage({
  picture,
  alt,
  className,
  priority = false,
  sizes = '100vw',
  objectPosition,
}: HeroImageProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
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
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding={priority ? 'sync' : 'async'}
        />
      </picture>
    </div>
  )
}
