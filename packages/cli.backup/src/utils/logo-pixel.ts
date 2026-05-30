export const LOGO_WIDTH = 60;
export const LOGO_HEIGHT = 10;

// Miniature KLAIR frame-mark logo as ASCII pixel art
export const KLAIR_PIXEL_LOGO = [
  "                                                        ",
  "   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ",
  "   ██                    ██   ",
  "   ██                    ██   ",
  "   ██                    ██   ",
  "   ██         ●          ██   ",
  "   ██                    ██   ",
  "   ██                    ██   ",
  "   ██                    ██   ",
  "   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ",
];

export function renderPixelLogo(): string[] {
  return KLAIR_PIXEL_LOGO;
}

export function renderPixelLogoCompact(): string[] {
  return [
    "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
    "██                    ██",
    "██         ●          ██",
    "██                    ██",
    "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀",
  ];
}