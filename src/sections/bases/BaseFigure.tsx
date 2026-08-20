import { basePictures } from './images'
import styles from './BaseFigure.module.css'

/** A bases photograph. Ratio, radius and focal point arrive as custom
    properties, since CSS Modules hash class names per file. */
export function BaseFigure({
  name,
  alt,
  className,
  sizes = '(min-width: 900px) 640px, 92vw',
}: {
  name: keyof typeof basePictures
  alt: string
  className?: string
  sizes?: string
}) {
  const picture = basePictures[name]

  return (
    <div className={[styles.figure, className].filter(Boolean).join(' ')}>
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
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  )
}
