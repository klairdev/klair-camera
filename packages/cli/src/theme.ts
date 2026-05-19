export const theme = {
  bg: "#181717",
  bgElevated: "#242323",
  bgActive: "#2a2929",
  bgHover: "#323131",
  text: "#F8FAED",
  textMuted: "#787D6E",
  textDim: "#5C634E",
  accent: "#A91B18",
  cerulean: "#CEE7F3",
  success: "#4C8258",
  warning: "#B48C3C",
  error: "#A91B18",
  border: "#3a3939",
  borderLight: "#4a4949",
  diffAdded: "#1a4d1a",
  diffRemoved: "#4d1a1a",
  dot: "#3a3939",
  dotActive: "#A91B18",
};

export function dotPattern(width: number, density = 0.3): string {
  const chars = ["·", "•", "◦", " "];
  let result = "";
  for (let i = 0; i < width; i++) {
    const rand = Math.random();
    if (rand < density) {
      result += chars[Math.floor(Math.random() * chars.length)];
    } else {
      result += " ";
    }
  }
  return result;
}

export function divider(width: number, char = "─"): string {
  return char.repeat(width);
}

export function pill(text: string, active = false): string {
  return active ? `● ${text}` : `○ ${text}`;
}
