export const theme = {
  red: '#A91B18',
  cerulean: '#CEE7F3',
  noir: '#181717',
  linen: '#F8FAED',
  canvas: '#F8FAED',
  structure: '#181717',
  space: '#CEE7F3',
  signal: '#A91B18',
  noir05: 'rgba(24,23,23,0.05)',
  noir10: 'rgba(24,23,23,0.10)',
  noir20: 'rgba(24,23,23,0.20)',
  noir50: 'rgba(24,23,23,0.50)',
  noir70: 'rgba(24,23,23,0.70)',
  yellow: '#FFD700',
  orange: '#FF9500',
  greenDeep: '#2D5016',
  grayMuted: '#999999',
  sidebar: '#F0F0F0',
} as const;

export type FrameState = 'watching' | 'analyzing' | 'alerting' | 'verifying';

export const frameColors: Record<FrameState, { ring: string; dot: string; pulse: boolean }> = {
  watching:  { ring: 'rgba(206,231,243,0.60)', dot: '#CEE7F3', pulse: false },
  analyzing: { ring: 'rgba(24,23,23,0.20)',    dot: '#181717', pulse: true  },
  alerting:  { ring: 'rgba(169,27,24,0.30)',   dot: '#A91B18', pulse: true  },
  verifying: { ring: 'rgba(206,231,243,0.40)', dot: '#CEE7F3', pulse: false },
};
