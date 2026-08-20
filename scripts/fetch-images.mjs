/**
 * Downloads the client's own photography from studvonaxe.it into
 * raw-images/ (git-ignored) and reports each file's dimensions.
 *
 * The site's WordPress REST API is blocked by a security plugin, so this
 * walks the Yoast sitemaps instead, scrapes upload URLs out of the page
 * HTML, and strips WordPress size suffixes to request the originals.
 *
 * Photographs are NOT committed automatically: review the dimension
 * report first. Anything under ~1600px wide is unusable for the hero or
 * the full-bleed bases section and should be requested from the client
 * as an original camera file.
 *
 * Run: npm run images:fetch
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import sharp from 'sharp'

const ORIGIN = 'https://www.studvonaxe.it'
const SITEMAPS = ['/page-sitemap.xml', '/cavalli-sitemap.xml']
const OUT_DIR = fileURLToPath(new URL('../raw-images/', import.meta.url))
const HERO_MIN_WIDTH = 1600

/* A plain desktop UA: some WordPress image plugins substitute WebP or a
   downscaled variant when they detect otherwise. */
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/html,image/jpeg,image/png;q=0.9,*/*;q=0.8',
}

async function get(url) {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}

/** WordPress writes name-1024x768.jpg next to the original name.jpg. */
function stripSizeSuffix(url) {
  return url.replace(/-\d{2,5}x\d{2,5}(?=\.[a-z]{3,4}$)/i, '')
}

async function collectPageUrls() {
  const pages = new Set()
  for (const path of SITEMAPS) {
    try {
      const xml = await (await get(ORIGIN + path)).text()
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) pages.add(m[1])
    } catch (err) {
      console.warn(`! sitemap ${path}: ${err.message}`)
    }
  }
  return [...pages]
}

async function collectImageUrls(pageUrls) {
  const images = new Set()
  for (const page of pageUrls) {
    try {
      const html = await (await get(page)).text()
      for (const m of html.matchAll(
        /https?:\/\/[^"'\s)]+\/wp-content\/uploads\/[^"'\s)]+\.(?:jpe?g|png)/gi,
      )) {
        images.add(stripSizeSuffix(m[0]))
      }
    } catch (err) {
      console.warn(`! page ${page}: ${err.message}`)
    }
  }
  return [...images]
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const pageUrls = await collectPageUrls()
  console.log(`Found ${pageUrls.length} pages in the sitemaps.`)

  const imageUrls = await collectImageUrls(pageUrls)
  console.log(`Found ${imageUrls.length} distinct upload URLs.\n`)

  const report = []
  for (const url of imageUrls) {
    const name = decodeURIComponent(url.split('/').pop())
    try {
      const buf = Buffer.from(await (await get(url)).arrayBuffer())
      await writeFile(OUT_DIR + name, buf)
      const { width = 0, height = 0 } = await sharp(buf).metadata()
      report.push({ name, width, height, kb: Math.round(buf.length / 1024) })
    } catch (err) {
      console.warn(`! ${name}: ${err.message}`)
    }
  }

  report.sort((a, b) => b.width - a.width)

  console.log('Dimension report (widest first):')
  for (const r of report) {
    const flag = r.width < HERO_MIN_WIDTH ? '  <- too small for full bleed' : ''
    console.log(`  ${String(r.width).padStart(5)}x${r.height}  ${r.kb} kB  ${r.name}${flag}`)
  }

  const tooSmall = report.filter((r) => r.width < HERO_MIN_WIDTH).length
  console.log(
    `\n${report.length} downloaded. ${tooSmall} are under ${HERO_MIN_WIDTH}px wide` +
      ` and need original files from the client for hero or full-bleed use.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
