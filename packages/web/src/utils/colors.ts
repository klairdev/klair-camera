export const brand = {
  red: '#A91B18',
  cerulean: '#CEE7F3',
  noir: '#181717',
  linen: '#F8FAED',
  yellow: '#FFD700',
  orange: '#FF9500',
  green: '#2D5016',
  gray: '#999999',
} as const;

export type EventType = 'create' | 'modify' | 'delete';

export const eventColors: Record<EventType, { bg: string; text: string; dot: string }> = {
  create: { bg: '#E8F5E9', text: '#2D5016', dot: '#2D5016' },
  modify: { bg: '#E3F2FD', text: '#1565C0', dot: '#1565C0' },
  delete: { bg: '#FFEBEE', text: '#A91B18', dot: '#A91B18' },
};

export type FrameState = 'watching' | 'analyzing' | 'alerting' | 'verifying';

export const stateColors: Record<FrameState, { ring: string; dot: string; pulse: boolean; label: string }> = {
  watching:  { ring: 'rgba(206,231,243,0.6)', dot: '#CEE7F3', pulse: false, label: 'watching' },
  analyzing: { ring: 'rgba(24,23,23,0.2)',    dot: '#181717', pulse: true,  label: 'analyzing' },
  alerting:  { ring: 'rgba(169,27,24,0.3)',   dot: '#A91B18', pulse: true,  label: 'alerting' },
  verifying: { ring: 'rgba(206,231,243,0.4)', dot: '#CEE7F3', pulse: false, label: 'verifying' },
};
