import React from 'react';
import type { FrameState } from '../styles/theme';

interface StatusIndicatorProps {
  state: FrameState;
  label?: string;
}

const labels: Record<FrameState, string> = {
  watching: 'watching',
  analyzing: 'analyzing',
  alerting: 'alerting',
  verifying: 'verifying',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state, label }) => (
  <div className="flex items-center gap-2">
    <span className={`inline-block w-2 h-2 rounded-full ${
      state === 'alerting' ? 'bg-signal' : state === 'analyzing' ? 'bg-structure' : 'bg-cerulean'
    } ${state === 'analyzing' || state === 'alerting' ? 'animate-pulse' : ''}`} />
    <span className="text-xs text-noir-50 lowercase">{label ?? labels[state]}</span>
  </div>
);
