/**
 * Optimizes the client's logo artwork for web use, and derives the
 * standalone icon mark (crown, ears, blaze circle) used in small badges.
 *
 * The supplied files are ~1400px wide and 210 to 250 kB, but the lockup is
 * never rendered above ~190 CSS px. This downsizes to a comfortable 3x
 * and writes WebP (alpha preserved), which the page consumes directly.
 *
 * The icon mark does not exist as a separate asset from the client, so it
 * is cropped out of the stacked lockup. The crop coordinates were found by
 * scanning the source PNG for alpha content per row and per column; the
 * icon and the wordmark's decorative rule sit close enough vertically that
 * a single crop always caught a sliver of the rule, so the icon is instead
 * built from two slices (above and below the rule) stitched with no gap.
 * TODO client-confirm: replace with a real vector icon mark if the client
 * supplies one, this crop is a stand in.
 *
 * Run: node scripts/build-brand.mjs
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const brandDir = fileURLToPath(new URL('../src/assets/brand/', import.meta.url))

const LOCKUP_TARGETS = [
  { in: 'logo-horizontal-light.png', out: 'logo-horizontal-light.webp', width: 600 },
  { in: 'logo-stacked-light.png', out: 'logo-stacked-light.webp', width: 600 },
]

/* Crop box for the icon, found against logo-stacked-light.png at its
   source resolution (1402x1122). Centered on the icon's own extent
   (x 454 to 945), with padding, split around the rule line at y 570-575. */
const ICON_SOURCE = 'logo-stacked-light.png'
const ICON_CROP = { left: 414, width: 575 }
const ICON_TOP_SLICE = { top: 0, height: 569 }
const ICON_BOTTOM_SLICE = { top: 578, height: 57 }
const ICON_OUT_WIDTH = 240

await mkdir(brandDir, { recursive: true })

for (const target of LOCKUP_TARGETS) {
  const info = await sharp(brandDir + target.in)
    .resize({ width: target.width, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(brandDir + target.out)

  console.log(
    `${target.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} kB`,
  )
}

const topSlice = await sharp(brandDir + ICON_SOURCE)
  .extract({ left: ICON_CROP.left, width: ICON_CROP.width, ...ICON_TOP_SLICE })
  .toBuffer()
const bottomSlice = await sharp(brandDir + ICON_SOURCE)
  .extract({ left: ICON_CROP.left, width: ICON_CROP.width, ...ICON_BOTTOM_SLICE })
  .toBuffer()

const stitched = sharp({
  create: {
    width: ICON_CROP.width,
    height: ICON_TOP_SLICE.height + ICON_BOTTOM_SLICE.height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
}).composite([
  { input: topSlice, top: 0, left: 0 },
  { input: bottomSlice, top: ICON_TOP_SLICE.height, left: 0 },
])

const iconInfo = await stitched
  .png()
  .toBuffer()
  .then((buf) =>
    sharp(buf)
      .resize({ width: ICON_OUT_WIDTH, withoutEnlargement: true })
      .webp({ quality: 92, alphaQuality: 100, effort: 6 })
      .toFile(brandDir + 'icon-mark-light.webp'),
  )

console.log(
  `icon-mark-light.webp  ${iconInfo.width}x${iconInfo.height}  ${(iconInfo.size / 1024).toFixed(1)} kB`,
)
