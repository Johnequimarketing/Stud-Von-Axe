import { copy, damlines, availablePairingCount } from '@/content'
import { Container, CTALink, Pedigree, Reveal } from '@/components/primitives'
import { Accented } from './Accented'
import { Photo } from './Photo'
import { Plaque } from './Plaque'
import { tenutaImages } from './images'
import styles from './Programme.module.css'

/**
 * The programme: Foals, Embryos, Semen as three full-width editorial
 * blocks, each with a different composition so the run never reads as
 * three of the same card. Foals carry photography right, Semen left, and
 * Embryos are purely typographic: an embryo has no photograph, so the
 * sire x dam lockup IS the image, this project's oldest design decision.
 *
 * All titles and descriptions come from the approved `offer` copy; the
 * embryo facts are counted from the pairing data at render time.
 *
 * Elementor map: three containers with alternating column order; the
 * embryo block is headings and text only. An interactive accordion
 * alternative is documented in the build map, not built.
 */

/* The one pairing shown: the first of the first damline, which is real
   data, never an example written here. */
const face = damlines[0]
const facePairing = face.pairings[0]

/* Both derived: the count from the data's length, the year from the data's
   own expected years. */
const expectedYears = damlines
  .flatMap((d) => d.pairings)
  .map((p) => p.expectedYear)
  .filter((y): y is number => typeof y === 'number')
const pairingYear = Math.min(...expectedYears)

/* Mark's stat mini-card trio, every number counted from the data. */
const statCopy = copy.tenuta.programme
const stats = [
  { value: String(availablePairingCount), label: statCopy.statPairings },
  { value: String(damlines.length), label: statCopy.statDamlines },
  { value: String(pairingYear), label: statCopy.statExpected },
]

export function Programme() {
  const offer = copy.offer
  const t = copy.tenuta.programme
  const foals = offer.lines[0]
  const embryos = offer.lines[1]
  const semen = offer.lines[2]

  return (
    <section id="programme" className={styles.section} aria-labelledby="programme-heading">
      <Container>
        <Reveal className={styles.head}>
          <Plaque index={3}>{t.label}</Plaque>
          <h2 id="programme-heading" className={styles.heading}>
            <Accented
              text={offer.heading}
              accent={offer.headingAccent}
              emClassName={styles.accent}
            />
          </h2>
        </Reveal>

        {/* ---- 01 Foals: image right ------------------------------- */}
        <Reveal>
          <div className={styles.block}>
            <div className={styles.blockText}>
            <p className={styles.number} aria-hidden="true">
              01
            </p>
            <h3 className={styles.blockTitle}>{foals.title}</h3>
            <p className={styles.blockBody}>{foals.description}</p>
              <CTALink href="#horses">{foals.cta}</CTALink>
            </div>
            <Photo
              picture={tenutaImages.programmeFoals}
              alt="A mare and her foal in a field"
              sizes="(min-width: 900px) 50vw, 100vw"
              className={styles.blockPhoto}
              hover
            />
          </div>
        </Reveal>

        {/* ---- 02 Embryos: the page's one dark plate ----------------
            An embryo has no photograph, so typography carries the block:
            the lockup as the image, and Mark's stat mini-card trio with
            every number counted from the pairing data. */}
        <Reveal>
          <div className={styles.embryoBlock} data-theme="inverse">
            <div className={styles.blockText}>
              <p className={styles.number} aria-hidden="true">
                02
              </p>
              <h3 className={styles.blockTitle}>{embryos.title}</h3>
              <p className={styles.blockBody}>{embryos.description}</p>
              <CTALink href="#contact" className={styles.embryoCta}>
                {t.pairingsCta}
              </CTALink>
            </div>
            <div className={styles.lockup}>
              <p className={styles.lockupLine}>
                <span className={styles.lockupName}>{facePairing.sire}</span>
                <span className={styles.lockupCross} aria-hidden="true">
                  {' '}
                  ×{' '}
                </span>
                <span className={styles.lockupName}>{face.dam}</span>
              </p>
              <Pedigree pedigree={face.pedigree} size="meta" className={styles.lockupPedigree} />
              <ul className={styles.stats} role="list">
                {stats.map((stat) => (
                  <li key={stat.label} className={styles.stat}>
                    <p className={styles.statValue}>{stat.value}</p>
                    <p className={styles.statLabel}>{stat.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* ---- 03 Semen: image left --------------------------------- */}
        <Reveal>
          <div className={styles.block} data-flip="true">
            <div className={styles.blockText}>
            <p className={styles.number} aria-hidden="true">
              03
            </p>
            <h3 className={styles.blockTitle}>{semen.title}</h3>
            <p className={styles.blockBody}>{semen.description}</p>
              <CTALink href="#contact">{copy.semen.cta}</CTALink>
            </div>
            <Photo
              picture={tenutaImages.programmeSemen}
              alt="A horse in profile"
              sizes="(min-width: 900px) 50vw, 100vw"
              className={styles.blockPhoto}
              hover
            />
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
