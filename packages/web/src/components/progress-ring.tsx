import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  showPercent?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#A91B18',
  bgColor = '#F0F0F0',
  label,
  showPercent = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setAnimated(0);
    const timer = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Animated progress ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (animated / 100) * circumference }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {showPercent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-structure lowercase">
              {Math.round(value)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50">
          {label}
        </span>
      )}
    </div>
  );
};
