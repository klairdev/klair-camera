import fs from 'node:fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const BLOCK = '█';

function decodeImage(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    const png = PNG.sync.read(buffer);
    return { data: png.data, width: png.width, height: png.height };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    const jpg = jpeg.decode(buffer, { useTArray: true });
    return { data: jpg.data, width: jpg.width, height: jpg.height };
  }
  throw new Error('Unsupported image format (need PNG or JPEG)');
}

function isBackground(r, g, b, a) {
  if (a < 40) return true;
  return r > 232 && g > 230 && b > 220;
}

function isRed(r, g, b) {
  return r > 130 && g < 95 && b < 95 && r > g * 1.4;
}

function redRunLength(data, w, h, x, y) {
  if (!isRed(data[(y * w + x) * 4], data[(y * w + x) * 4 + 1], data[(y * w + x) * 4 + 2])) {
    return 0;
  }
  let len = 1;
  for (let ix = x - 1; ix >= 0; ix--) {
    const i = (y * w + ix) * 4;
    if (!isRed(data[i], data[i + 1], data[i + 2])) break;
    len++;
  }
  for (let ix = x + 1; ix < w; ix++) {
    const i = (y * w + ix) * 4;
    if (!isRed(data[i], data[i + 1], data[i + 2])) break;
    len++;
  }
  return len;
}

/** Mark eye pixels (small red squares, not thick bracket strokes). */
function buildEyeMask(data, w, h) {
  const mask = new Set();
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isRed(r, g, b)) continue;

      const run = redRunLength(data, w, h, x, y);
      const inCenter =
        Math.abs(x - cx) < w * 0.22 && y > h * 0.28 && y < h * 0.62;
      if (inCenter && run <= 22) {
        mask.add(`${x},${y}`);
      }
    }
  }
  return mask;
}

function sampleRegion(data, w, h, x0, y0, x1, y1, eyeMask) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  let eyeHits = 0;
  let solidHits = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];
      const pa = data[i + 3];
      if (isBackground(pr, pg, pb, pa)) continue;
      r += pr;
      g += pg;
      b += pb;
      count++;
      if (eyeMask.has(`${x},${y}`)) eyeHits++;
      solidHits++;
    }
  }

  if (!count) return null;
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
    isEye: eyeHits > 0 && eyeHits >= solidHits * 0.35,
  };
}

function cellColor(cell, colorOn) {
  if (!colorOn) return BLOCK;
  return `\x1b[38;2;${cell.r};${cell.g};${cell.b}m${BLOCK}\x1b[0m`;
}

/**
 * Pixel-faithful mascot from logo.png — same shapes & colors as the file.
 */
export function rasterizeLogo(filePath, { cols = 28, color = true, eyesOpen = true } = {}) {
  const buffer = fs.readFileSync(filePath);
  const { data, width, height } = decodeImage(buffer);
  const eyeMask = buildEyeMask(data, width, height);
  const rows = Math.max(7, Math.round(cols * (height / width) * 0.52));

  const open = [];
  const closed = [];

  for (let gy = 0; gy < rows; gy++) {
    let o = '';
    let c = '';
    const y0 = Math.floor((gy / rows) * height);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) / rows) * height));

    for (let gx = 0; gx < cols; gx++) {
      const x0 = Math.floor((gx / cols) * width);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) / cols) * width));
      const cell = sampleRegion(data, width, height, x0, y0, x1, y1, eyeMask);

      if (!cell) {
        o += ' ';
        c += ' ';
        continue;
      }

      if (cell.isEye && !eyesOpen) {
        o += ' ';
        c += ' ';
        continue;
      }

      o += color ? cellColor(cell, true) : BLOCK;
      c += color ? cellColor(cell, true) : BLOCK;
    }

    open.push(o.replace(/\s+$/u, ''));
    closed.push(c.replace(/\s+$/u, ''));
  }

  while (open.length && open[0].trim() === '') {
    open.shift();
    closed.shift();
  }
  while (open.length && open[open.length - 1].trim() === '') {
    open.pop();
    closed.pop();
  }

  return { open, closed, width: cols };
}
