import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(__dirname, '../src/assets/icon.svg')
const outDir = path.join(__dirname, '../public')
const svgBuffer = readFileSync(svgPath)

const MAGENTA = '#E5199A'
const MASKABLE_SCALE = 0.78

async function main() {
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png'))
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png'))
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'))

  const scaledSize = Math.round(512 * MASKABLE_SCALE)
  const scaledArt = await sharp(svgBuffer).resize(scaledSize, scaledSize).png().toBuffer()

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: MAGENTA },
  })
    .composite([{ input: scaledArt, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'icon-512-maskable.png'))

  console.log('Generated icon-192.png, icon-512.png, icon-512-maskable.png, apple-touch-icon.png in public/')
}

main()
