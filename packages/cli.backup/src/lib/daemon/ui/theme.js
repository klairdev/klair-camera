/** Klair CLI color system — restrained, premium */

export const colors = {
  white: [248, 250, 237],
  muted: [120, 125, 110],
  dim: [92, 99, 78],
  accent: [169, 27, 24],
  cerulean: [206, 231, 243],
  success: [76, 130, 88],
  warning: [180, 140, 60],
  error: [169, 27, 24],
  noir: [24, 23, 23],
};

export function supportsColor() {
  return !process.env.NO_COLOR && process.stdout.isTTY;
}

export function isTty() {
  return Boolean(process.stdout.isTTY);
}

export function termWidth() {
  return process.stdout.columns ?? 80;
}

export function style(rgb, text) {
  if (!supportsColor()) return text;
  const [r, g, b] = rgb;
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

export const paint = {
  white: (t) => style(colors.white, t),
  muted: (t) => style(colors.muted, t),
  dim: (t) => style(colors.dim, t),
  accent: (t) => style(colors.accent, t),
  cerulean: (t) => style(colors.cerulean, t),
  success: (t) => style(colors.success, t),
  warning: (t) => style(colors.warning, t),
  error: (t) => style(colors.error, t),
  noir: (t) => style(colors.noir, t),
};

export function stripAnsi(s = '') {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

export function visibleLen(s = '') {
  return stripAnsi(s).length;
}
