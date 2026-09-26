import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

let cached: Promise<Buffer> | null = null;

// The logo PNG is a large marketing asset; PDFs only render it at 30x30pt,
// so downscale once and cache instead of embedding the full-size file on every render.
export function getPdfLogoBuffer(): Promise<Buffer> {
  if (!cached) {
    const raw = fs.readFileSync(path.join(process.cwd(), "public/images/logo.png"));
    cached = sharp(raw).resize(120, 120).png().toBuffer();
  }
  return cached;
}
