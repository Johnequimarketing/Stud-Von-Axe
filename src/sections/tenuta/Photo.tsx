import type { Picture } from '@/sections/hero/images'
import styles from './Photo.module.css'

/**
 * The one photographic figure for Direction C. Ratio, focal point and
 * hover behaviour arrive as custom properties, because CSS Modules hash
 * class names per file:
 *
 *   --figure-ratio      aspect ratio (default 4 / 5)
 *   --figure-position   object-position focal point (default 50% 50%)
 *
 * Set data-hover="scale" for the slow zoom on hover; the transform lives
 * on the img so the frame stays still, which is exactly how the Elementor
 * rebuild does it (CSS hover on the image inside a clipped container).
 */
export function Photo({
  picture,
  alt,
  className,
  sizes = '(min-width: 900px) 640px, 92vw',
  hover = false,
  eager = false,
}: {
  picture: Picture
  alt: string
  className?: string
  sizes?: string
  hover?: boolean
  eager?: boolean
}) {
  return (
    <div
      className={[styles.figure, className].filter(Boolean).join(' ')}
      data-hover={hover ? 'scale' : undefined}
    >
      <picture>
        {Object.entries(picture.sources).map(([format, srcSet]) => (
          <source
            key={format}
            type={`image/${format}`}
            srcSet={srcSet}
            sizes={sizes}
          />
        ))}
        <img
          src={picture.img.src}
          width={picture.img.w}
          height={picture.img.h}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </picture>
    </div>
  )
}
