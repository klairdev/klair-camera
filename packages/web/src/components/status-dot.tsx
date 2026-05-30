import React from 'react';
import { motion } from 'framer-motion';
import type { FrameState } from '../styles/theme';
import { stateColors } from '../utils/colors';

interface StatusDotProps {
  state: FrameState;
  showLabel?: boolean;
  size?: number;
}

export const StatusDot: React.FC<StatusDotProps> = ({ state, showLabel = true, size = 3 }) => {
  const c = stateColors[state];

  return (
    <div className="flex items-center gap-2">
      {c.pulse ? (
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block rounded-full"
          style={{ width: size * 4, height: size * 4, backgroundColor: c.dot }}
        />
      ) : (
        <span
          className="inline-block rounded-full"
          style={{ width: size * 4, height: size * 4, backgroundColor: c.dot }}
        />
      )}
      {showLabel && (
        <span className="text-xs text-noir-50 uppercase tracking-[0.1em] font-semibold">
          {c.label}
        </span>
      )}
    </div>
  );
};
