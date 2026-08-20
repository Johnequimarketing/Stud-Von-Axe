import { copy, type Damline } from '@/content'
import { Pedigree, type MetaItem } from '@/components/primitives'
/* The catalogue photography lives with the section that introduced it. A
   damline's photograph is the dam herself, who is a living horse with a
   verified picture, so the provenance rule already covers her. */
import { horsePictures } from '../available/images'
import styles from './parts.module.css'

/** Shared pieces of the embryo section. */

export const damPhoto = (line: Damline) => horsePictures[line.id]

export const pairingCount = (line: Damline) => line.pairings.length

export function countWord(n: number) {
  return n === 1 ? copy.bloodlines.pairingWord : copy.bloodlines.pairingWordPlural
}

/** The yard's short name for a dam, so five of them fit in one control
    beside the heading. The full name always shows in the panel. */
export const shortName = (line: Damline) => line.dam.split(' ')[0]

/** The live embryos index until internal damline routes exist.
    TODO client-confirm: point at /embryos/{damline} when those are built. */
export const EMBRYO_INDEX = 'https://www.studvonaxe.it/en/embryos/'

/**
 * The compact spec row, every value counted from the pairing data. There is
 * no price here because the stud publishes none: the reference layout this
 * follows carries a covering fee, and inventing one is not an option.
 */
export function damSpecs(line: Damline): MetaItem[] {
  const frozen = line.pairings.filter((p) => p.form === 'frozen').length
  const expected = line.pairings.length - frozen
  const years = [...new Set(line.pairings.map((p) => p.expectedYear))].sort()

  const form = [
    expected > 0 ? `${expected} ${copy.bloodlines.expectedLabel}` : null,
    frozen > 0 ? `${frozen} ${copy.bloodlines.frozenLabel}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return [
    { label: copy.bloodlines.specPairings, value: String(pairingCount(line)) },
    { label: copy.bloodlines.specForm, value: form },
    { label: copy.bloodlines.specAvailable, value: years.join(', ') },
  ]
}

/**
 * A dam's photograph, or her pedigree in its place. Two of the five dams
 * have no picture whose filename names them, and a lookalike is never
 * substituted, so those two are carried by type.
 */
export function DamFigure({
  line,
  width,
  className,
}: {
  line: Damline
  width: number
  className?: string
}) {
  const picture = damPhoto(line)

  if (!picture) {
    return (
      <div
        className={[styles.figure, styles.stand, className]
          .filter(Boolean)
          .join(' ')}
        data-theme="inverse"
      >
        <Pedigree pedigree={line.pedigree} size="body" />
      </div>
    )
  }

  return (
    <div className={[styles.figure, className].filter(Boolean).join(' ')}>
      <picture>
        {Object.entries(picture.sources).map(([format, srcSet]) => (
          <source
            key={format}
            type={`image/${format}`}
            srcSet={srcSet}
            sizes={`(min-width: 900px) ${width}px, 92vw`}
          />
        ))}
        <img
          src={picture.img.src}
          width={picture.img.w}
          height={picture.img.h}
          alt={line.dam}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  )
}
