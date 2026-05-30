import React from 'react';
import type { FrameState } from '../styles/theme';
import { frameColors } from '../styles/theme';

interface LogoProps {
  state?: FrameState;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ state = 'watching', size = 18 }) => {
  const c = frameColors[state];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center shrink-0"
        style={{ width: size + 8, height: size + 8 }}>
        <div className="absolute inset-0 rounded-md border"
          style={{ borderColor: c.ring, transition: 'border-color 0.6s ease' }} />
        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-600 ${c.pulse ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: c.dot }} />
      </div>
      <span className="text-lg font-medium text-structure lowercase tracking-[-0.02em]">
        klair
      </span>
    </div>
  );
};
