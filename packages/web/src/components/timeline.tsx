import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { formatTimeAgo, shortenPath } from '../utils/format';
import type { KlairEvent } from '../utils/mock-data';

interface TimelineProps {
  events: KlairEvent[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  emptyMessage?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  selectedId,
  onSelect,
  emptyMessage = 'no events captured yet',
}) => {
  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-noir-50 lowercase">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Spine */}
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-cerulean" />

      {events.map((e: KlairEvent) => {
        const active = selectedId === e.id;
        return (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelect(e.id)}
            className={`relative flex items-start gap-4 py-4 pl-8 pr-4 rounded-xl cursor-pointer transition-all duration-200 ${
              active
                ? 'bg-noir-05 ring-1 ring-noir-20 shadow-sm'
                : 'hover:bg-noir-05'
            }`}
          >
            {/* Dot on spine */}
            <motion.div
              animate={active ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
              className={`absolute left-[15px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white shrink-0 ${
                e.eventType === 'create'
                  ? 'bg-green-deep'
                  : e.eventType === 'modify'
                    ? 'bg-cerulean'
                    : 'bg-signal'
              } ${active ? 'ring-2 ring-noir-20' : ''}`}
            />

            {/* Timestamp */}
            <div className="w-16 shrink-0 text-right">
              <div className="text-[11px] font-mono text-noir-50 lowercase">
                {formatTimeAgo(e.timestamp)}
              </div>
              <div className="text-[10px] text-noir-20 mt-0.5">#{e.id}</div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-structure lowercase truncate">
                  {shortenPath(e.file)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge type={e.eventType as any} />
                <span className="text-[11px] text-noir-50 font-mono lowercase">
                  +{e.duration}ms
                </span>
                {active && (
                  <span className="text-[10px] text-signal lowercase font-medium ml-auto">
                    selected {'\u2192'}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
