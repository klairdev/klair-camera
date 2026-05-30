import React from 'react';
import { motion } from 'framer-motion';
import { formatTimestamp } from '../utils/format';

interface BarData {
  label: string;
  value: number;
  timestamp?: number;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  color?: string;
  secondary?: string;
  yMax?: number;
  showTooltip?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 120,
  color = '#A91B18',
  secondary = '#CEE7F3',
  yMax,
  showTooltip = true,
}) => {
  const max = yMax ?? Math.max(1, ...data.map((d) => d.value));
  const ticks = [0, Math.ceil(max / 3), Math.ceil((max * 2) / 3), max];

  return (
    <div className="relative pl-10">
      {/* Y-axis */}
      <div
        className="absolute left-0 flex flex-col justify-between text-right"
        style={{ top: 0, bottom: 20, width: 32 }}
      >
        {ticks.map((v, i) => (
          <span key={i} className="text-[10px] font-mono text-noir-50 pr-1">
            {v}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-0.5" style={{ height }}>
        {data.map((d, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            transition={{ duration: 0.8, delay: i * 0.02, ease: 'easeOut' }}
            className="flex-1 min-w-[3px] rounded-t-sm relative group cursor-pointer"
            style={{ backgroundColor: d.value > max * 0.7 ? color : secondary }}
          >
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg bg-structure text-linen text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg lowercase">
                {d.timestamp ? formatTimestamp(d.timestamp) : d.label}: {d.value} events
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* X-axis */}
      <div className="flex justify-between mt-1 text-[10px] font-mono text-noir-50">
        {data.length > 8 ? (
          <>
            <span>24h</span>
            <span>12h</span>
            <span>now</span>
          </>
        ) : (
          data.map((d, i) => (
            <span key={i} className="truncate max-w-[40px]">
              {d.label}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
