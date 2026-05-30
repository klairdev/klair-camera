export const theme = {
  bg: "#0A0A0A",
  bgElevated: "#1A1A1A",
  bgActive: "#2A0A08",
  bgHover: "#1F1F1F",
  text: "#E8E8E8",
  textMuted: "#888888",
  textDim: "#555555",
  accent: "#A91B18",
  cerulean: "#CEE7F3",
  success: "#4C8258",
  warning: "#FFD700",
  error: "#A91B18",
  border: "#333333",
  borderLight: "#444444",
  diffAdded: "#0A2A0A",
  diffRemoved: "#2A0A08",
  diffAddText: "#4C8258",
  diffDelText: "#A91B18",
  diffHunkText: "#CEE7F3",
  // Pixel art logo colors
  logoBg: "#1C1C1C",
  logoFrame: "#5F0000",
  logoFrameMid: "#870000",
  logoFrameHighlight: "#AF0000",
  logoTint: "#262626",
  logoDark: "#121212",
  logoSurface: "#4E4E4E",
  logoLight: "#EEEEEE",
  logoWhite: "#FFFFFF",
  logoGray: "#585858",
  logoGrayBlue: "#5F5F5F",
  logoGrayLight: "#DADADA",
  logoGrayLighter: "#E4E4E4",
  logoGrayMuted: "#8A8A8A",
  logoGrayDark: "#303030",
  logoGrayMid: "#3A3A3A",
  dot: "#555555",
  dotActive: "#A91B18",
  tabActive: "#A91B18",
  tabInactive: "#555555",
};

export function divider(width: number, char = "\u2500"): string {
  return char.repeat(width);
}

export function progressBar(value: number, max: number, width: number): string {
  const filled = Math.round((value / max) * width);
  return "\u2588".repeat(filled) + "\u2591".repeat(Math.max(0, width - filled));
}
