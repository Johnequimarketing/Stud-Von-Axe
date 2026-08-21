import type { Picture } from '@/sections/hero/images'
import styles from './HeroMedia.module.css'

/**
 * The cinematic media slot. When a video source is configured it renders a
 * muted, looping, lazily loaded video with the photograph as its poster;
 * until then, the photograph alone with a very slow scale (killed under
 * reduced motion). The composition around it never knows which one it got.
 *
 * TODO client-confirm: no footage exists yet. When it arrives, host the
 * file, set VIDEO_SRC, and everything else stays as it is. Keep the clip
 * under ~8MB, no audio track, and let the poster carry the first paint.
 *
 * Elementor map: container background video with a fallback image; the
 * build map carries the settings (autoplay muted, no controls, poster,
 * "play on mobile" off so phones get the photograph).
 */
const VIDEO_SRC: string | null = null

export function HeroMedia({
  picture,
  sizes = '100vw',
}: {
  picture: Picture
  sizes?: string
}) {
  return (
    <div className={styles.media} aria-hidden="true">
      {VIDEO_SRC ? (
        <video
          className={styles.video}
          src={VIDEO_SRC}
          poster={picture.img.src}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        <picture className={styles.still}>
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
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      )}
    </div>
  )
}
