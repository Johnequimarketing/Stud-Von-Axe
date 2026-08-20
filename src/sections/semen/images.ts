/* Photography for the semen section.
 *
 * The provenance rule applies here in an unusual way. No stallion names are
 * published and no stallion photography exists, so a portrait of any horse
 * in this section would imply "this is the stallion whose semen is for
 * sale", which is a claim nobody has made. A conformation shot reads exactly
 * that way and was rejected for it.
 *
 * So this image is deliberately a DETAIL, not a portrait: cropped to the
 * plaited neck, the leather and the muscle. It carries presentation and care
 * without naming or implying a subject.
 *
 * Source: `NB2_4577.jpg` from the client's own uploads, 4183x3336, cropped
 * to the neck at 2929x1668. TODO client-confirm which horse it shows, the
 * same open question the offer section's atmosphere photography carries.
 */

import detail from '@/assets/img/semen-detail.jpg?w=760;1140;1520;2040;2560&format=avif;webp;jpeg&as=picture'

import type { Picture } from '@/sections/hero/images'

export const semenDetail = detail as Picture
