import { paint, visibleLen } from './theme.js';

export function blank(n = 1) {
  return '\n'.repeat(Math.max(0, n - 1));
}

export function padEnd(str, width) {
  const vis = visibleLen(str);
  if (vis >= width) return str;
  return str + ' '.repeat(width - vis);
}

export function box(title, rows) {
  const w = Math.max(
    visibleLen(title) + 6,
    ...rows.map((r) => visibleLen(r)),
    32
  );
  const pad = '─'.repeat(Math.max(0, w - visibleLen(title) - 5));
  const out = [
    paint.dim(`┌─ ${title} ${pad}┐`),
    ...rows.map((r) => paint.dim(`│ ${padEnd(r, w - 4)} │`)),
    paint.dim(`└${'─'.repeat(w - 2)}┘`),
  ];
  return out;
}

export function joinColumns(left, right, gap = 3) {
  const lw = Math.max(...left.map(visibleLen), 0);
  const h = Math.max(left.length, right.length);
  const out = [];
  for (let i = 0; i < h; i++) {
    const l = left[i] ?? '';
    const r = right[i] ?? '';
    out.push(padEnd(l, lw) + ' '.repeat(gap) + r);
  }
  return out;
}
