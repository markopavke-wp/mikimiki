/**
 * Convert PNG sequence to WebP (after Blender export).
 * Usage: node scripts/frame-generator/png-to-webp.mjs [inputDir]
 */
import { readdirSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const input = process.argv[2] || join(process.cwd(), "public/frames_blender");
const output = join(process.cwd(), "public/frames");
mkdirSync(output, { recursive: true });

const files = readdirSync(input)
  .filter((f) => /\.png$/i.test(f))
  .sort();

let total = 0;
for (const file of files) {
  const match = file.match(/(\d+)/);
  const idx = match ? match[1].padStart(3, "0") : file;
  const out = join(output, `frame-${idx}.webp`);
  await sharp(join(input, file)).webp({ quality: 78, effort: 4 }).toFile(out);
  total += statSync(out).size;
  console.log(out);
}
console.log(`Ukupno: ${(total / 1024 / 1024).toFixed(2)} MB`);
