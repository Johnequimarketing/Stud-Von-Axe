import { copy, type NewsItem } from '@/content'
import { newsPictures } from './images'
import styles from './NewsCard.module.css'

/**
 * One story. With a verified photograph the card is image-led; without one
 * it is a navy typographic card carried by its headline, the same fallback
 * logic the catalogue runs on, and never a stand-in photo of another horse.
 */
export function NewsCard({ item }: { item: NewsItem }) {
  const picture = newsPictures[item.id]

  return (
    <li className={styles.item}>
      {/* TODO client-confirm: the live site's news links appear mismatched
          to their headlines: confirm real URLs. */}
      <a
        className={styles.card}
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {picture ? (
          <div className={styles.media}>
            <picture>
              {Object.entries(picture.sources).map(([format, srcSet]) => (
                <source
                  key={format}
                  type={`image/${format}`}
                  srcSet={srcSet}
                  sizes="(min-width: 900px) 360px, 80vw"
                />
              ))}
              <img
                src={picture.img.src}
                width={picture.img.w}
                height={picture.img.h}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        ) : (
          /* No verified photograph of this story's subject exists, so the
             headline carries the card. */
          <div className={styles.stand} data-theme="inverse" aria-hidden="true">
            <span className={styles.standMark}>×</span>
          </div>
        )}

        <div className={styles.body}>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.excerpt}>{item.excerpt}</p>
          <span className={styles.cta}>
            {copy.news.readMore}
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </span>
        </div>
      </a>
    </li>
  )
}
