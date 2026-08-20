import { COUNTRY_NAMES, copy, type Horse } from '@/content'
import { Pedigree } from '@/components/primitives'
import { horseDetailUrls, horsePictures } from './images'
import styles from './HorseCard.module.css'

/**
 * One horse in the catalogue run: a tall photograph with the name and, under
 * it, when and where the horse was bred, set over the foot of the image.
 *
 * The card deliberately holds four things and no more: the horse, its name,
 * its breeding line, and its status. The pedigree is the detail page's job,
 * and putting it here made every card in the run look the same from a
 * distance. There is no "View details" row either, because the whole card
 * is the link.
 */

/** Featured wins over status: a horse is only featured while it is still
    available, so showing both would say the same thing twice. */
function Badge({ horse }: { horse: Horse }) {
  /* Every horse in this section is available, so an "Available" chip on all
     of them is decoration rather than information. A chip appears only when
     it says something the section title does not already say. */
  if (!horse.featured && horse.status.kind === 'available') return null

  const country = horse.status.kind === 'sold' ? horse.status.country : null
  const tone = horse.featured
    ? styles.featured
    : horse.status.kind === 'sold'
      ? styles.sold
      : styles.reserved

  return (
    <span className={[styles.badge, tone].join(' ')}>
      {horse.featured
        ? copy.available.featuredLabel
        : horse.status.kind === 'sold'
          ? copy.status.sold
          : copy.status.reserved}
      {country ? (
        <>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <abbr className={styles.country} title={COUNTRY_NAMES[country]}>
            {country}
          </abbr>
        </>
      ) : null}
    </span>
  )
}

const sentenceCase = (word: string) => word[0].toUpperCase() + word.slice(1)

/** The yard's short name, so the card's link fits on one line. */
const shortName = (horse: Horse) => horse.name.split(' ')[0]

export function HorseCard({ horse }: { horse: Horse }) {
  const picture = horsePictures[horse.id]

  return (
    <li className={styles.item}>
      <a
        /* Points at the horse's own live page until internal detail routes
           exist. TODO client-confirm: swap to internal routes when built. */
        className={styles.card}
        href={horseDetailUrls[horse.id]}
        target="_blank"
        rel="noreferrer noopener"
      >
        {picture ? (
          <picture>
            {Object.entries(picture.sources).map(([format, srcSet]) => (
              <source
                key={format}
                type={`image/${format}`}
                srcSet={srcSet}
                sizes="(min-width: 900px) 300px, 78vw"
              />
            ))}
            <img
              src={picture.img.src}
              width={picture.img.w}
              height={picture.img.h}
              alt={horse.name}
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          /* No verified photograph of this horse exists yet. Its pedigree
             stands in for the image rather than a lookalike animal, which
             is the one place a pedigree appears on these cards. */
          <div className={styles.stand} data-theme="inverse">
            <Pedigree pedigree={horse.pedigree} size="body" />
          </div>
        )}

        <div className={styles.grade} aria-hidden="true" />

        <Badge horse={horse} />

        <div className={styles.caption}>
          <h3 className={styles.name}>{horse.name}</h3>
          {/* Year, sex and sire, which is the meta line the build brief
              specifies. The studbook it replaced is a detail page fact. */}
          <p className={styles.meta}>
            {[
              horse.year,
              horse.sex ? sentenceCase(horse.sex) : null,
              horse.pedigree[0],
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {/* The card is the link, but the brief asks it to say so and to
              name where it goes. */}
          <span className={styles.cta}>
            {copy.available.cardCta} {shortName(horse)}
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </span>
        </div>
      </a>
    </li>
  )
}
