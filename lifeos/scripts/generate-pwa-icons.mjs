import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(root, '..', 'public', 'favicon.svg');
const outDir = path.join(root, '..', 'public', 'icons', 'pwa');

const BG = '#020206';
const svgBuffer = readFileSync(svgPath);

async function logoBuffer(size) {
  return sharp(svgBuffer).resize(size, size, { fit: 'contain' }).png().toBuffer();
}

async function makeIcon(fileName, size, { logoScale, background }) {
  const logoSize = Math.round(size * logoScale);
  const logo = await logoBuffer(logoSize);
  const offset = Math.round((size - logoSize) / 2);
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: logo, left: offset, top: offset }])
    .png()
    .toFile(path.join(outDir, fileName));
  console.log('wrote', fileName);
}

await makeIcon('icon-192.png', 192, { logoScale: 0.62, background: BG });
await makeIcon('icon-512.png', 512, { logoScale: 0.62, background: BG });
// Maskable: keep art inside the ~80% safe-zone circle, opaque background required.
await makeIcon('maskable-icon-512.png', 512, { logoScale: 0.5, background: BG });
// Apple touch icon: iOS ignores alpha, so give it an explicit opaque background too.
await makeIcon('apple-touch-icon.png', 180, { logoScale: 0.62, background: BG });

console.log('done');
