export interface Session {
  id: string;
  startTime: number;
  targetDir: string;
  eventCount: number;
  isActive: boolean;
  cpu: number;
  memory: number;
  latency: number;
}

export interface KlairEvent {
  id: number;
  timestamp: number;
  file: string;
  eventType: 'create' | 'modify' | 'delete';
  duration: number;
  fileSize: number;
  diff: string;
}

const FILES = [
  'src/components/button.tsx',
  'src/components/card.tsx',
  'src/components/badge.tsx',
  'src/components/toggle.tsx',
  'src/utils/api.ts',
  'src/utils/format.ts',
  'src/pages/dashboard.tsx',
  'src/hooks/use-events.ts',
  'src/styles/index.css',
  'src/App.tsx',
  'src/pages/settings.tsx',
  'src/components/layout.tsx',
  'src/pages/diff-viewer.tsx',
  'src/components/status-dot.tsx',
  'src/components/input.tsx',
];

function createDiff(file: string): string {
  return [
    '@@ -0,0 +1,24 @@',
    '+import React from "react";',
    '+import { motion } from "framer-motion";',
    '+',
    '+interface Props {',
    '+  children: React.ReactNode;',
    '+  className?: string;',
    '+}',
    '+',
    '+export const Card: React.FC<Props> = ({ children, className }) => {',
    '+  return (',
    '+    <motion.div',
    '+      className={`bg-white rounded-2xl shadow-sm p-6 ${className || ""}`}',
    '+      whileHover={{ y: -2 }}',
    '+    >',
    '+      {children}',
    '+    </motion.div>',
    '+  );',
    '+};',
  ].join('\n');
}

function modifyDiff(file: string): string {
  return [
    '@@ -12,7 +12,9 @@',
    ' export const Card: React.FC<Props> = ({ children, className }) => {',
    '   return (',
    '     <motion.div',
    '-      className={`bg-white rounded-2xl shadow-sm p-6 ${className || ""}`}',
    '+      className={`bg-white rounded-card shadow-sm p-6 border ${className || ""}`}',
    '-      whileHover={{ y: -2 }}',
    '+      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.16)" }}',
    '+      transition={{ duration: 0.3 }}',
    '     >',
    '       {children}',
    '     </motion.div>',
  ].join('\n');
}

function deleteDiff(file: string): string {
  return [
    '@@ -1,24 +0,0 @@',
    '-import React from "react";',
    '-import { motion } from "framer-motion";',
    '-',
    '-interface Props {',
    '-  children: React.ReactNode;',
    '-  className?: string;',
    '-}',
    '-',
    '-export const Card: React.FC<Props> = ({ children, className }) => {',
    '-  return (',
    '-    <motion.div',
    '-      className={`bg-white rounded-2xl shadow-sm p-6 ${className || ""}`}',
    '-      whileHover={{ y: -2 }}',
    '-    >',
    '-      {children}',
    '-    </motion.div>',
    '-  );',
    '-};',
  ].join('\n');
}

const DIFF_FNS: Record<string, (f: string) => string> = {
  create: createDiff,
  modify: modifyDiff,
  delete: deleteDiff,
};

let _idCounter = 0;

export function resetIdCounter(): void {
  _idCounter = 0;
}

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateEvent(id?: number): KlairEvent {
  const type = (['create', 'create', 'create', 'modify', 'modify', 'modify', 'modify', 'delete'] as const)[random(0, 7)];
  _idCounter++;
  const file = pick(FILES);
  return {
    id: id ?? _idCounter,
    timestamp: Date.now() - random(0, 8 * 3600 * 1000),
    file,
    eventType: type,
    duration: random(12, 98),
    fileSize: random(1024, 65536),
    diff: DIFF_FNS[type](file),
  };
}

export function createInitialEvents(count: number): KlairEvent[] {
  _idCounter = 0;
  const events: KlairEvent[] = [];
  let t = Date.now() - 8 * 3600 * 1000;
  for (let i = 0; i < count; i++) {
    const type = (['create', 'create', 'modify', 'modify', 'modify', 'modify', 'delete'] as const)[random(0, 6)];
    t += random(30, 300) * 1000;
    const file = pick(FILES);
    events.push({
      id: i + 1,
      timestamp: t,
      file,
      eventType: type,
      duration: random(12, 98),
      fileSize: random(1024, 65536),
      diff: DIFF_FNS[type](file),
    });
  }
  _idCounter = count;
  return events;
}

export function createSession(): Session {
  return {
    id: 'ses_' + Math.random().toString(36).slice(2, 10),
    startTime: Date.now() - 2 * 3600 * 1000 - 14 * 60 * 1000,
    targetDir: '~/projects/ai-agent',
    eventCount: 247,
    isActive: true,
    cpu: 0.3,
    memory: 128,
    latency: 42,
  };
}
