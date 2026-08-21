import type { ReactNode } from 'react'
import type { Picture } from '@/sections/hero/images'
import { heroImages } from '@/sections/hero/images'
import { horsePictures } from '@/sections/available/images'
import { cieloImages } from './images'

/* The gallery pool, shared by every concept so a pick never changes which
 * photographs the section is allowed to show.
 *
 * `caption` is present ONLY where the photograph is verified as that horse
 * under the provenance rule (results-contouch and the catalogue pictures
 * are; the plaited neck and the grey are not tied to a named horse, so
 * they carry subject words or nothing). */
export interface GalleryFrame {
  id: string
  picture: Picture
  alt: string
  caption?: string
}

export const galleryFrames: GalleryFrame[] = [
  {
    id: 'contouch',
    picture: cieloImages.galleryContouch,
    alt: 'Contouch SVA jumping a fence in competition',
    caption: 'Contouch SVA',
  },
  {
    id: 'coolrock',
    picture: horsePictures['coolrock-von-axe-z'],
    alt: 'Coolrock Von Axe Z standing in a paddock',
    caption: 'Coolrock Von Axe Z',
  },
  {
    id: 'neck',
    picture: cieloImages.galleryNeck,
    alt: 'A plaited horse neck and shoulder in close up',
    caption: 'The plaits',
  },
  {
    id: 'grey',
    picture: heroImages.grey,
    alt: 'A dapple grey horse with a leather headcollar',
    caption: 'The dapple grey',
  },
  {
    id: 'charina',
    picture: horsePictures['charina-von-axe-z'],
    alt: 'Charina Von Axe Z as a foal in a field',
    caption: 'Charina Von Axe Z',
  },
  {
    id: 'agousha',
    picture: horsePictures['agousha-vd-berghoeve-z'],
    alt: 'Agousha vd Berghoeve Z jumping a fence',
    caption: 'Agousha vd Berghoeve Z',
  },
]

export function FramePicture({
  frame,
  sizes,
}: {
  frame: GalleryFrame
  sizes: string
}): ReactNode {
  return (
    <picture>
      {Object.entries(frame.picture.sources).map(([format, srcSet]) => (
        <source
          key={format}
          type={`image/${format}`}
          srcSet={srcSet}
          sizes={sizes}
        />
      ))}
      <img
        src={frame.picture.img.src}
        width={frame.picture.img.w}
        height={frame.picture.img.h}
        alt={frame.alt}
        loading="lazy"
      />
    </picture>
  )
}
