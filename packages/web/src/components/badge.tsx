import React from 'react';

type EventType = 'create' | 'modify' | 'delete' | 'add' | 'change' | 'unlink' | 'warning';

interface BadgeProps {
  type: EventType;
  label?: string;
  className?: string;
}

const typeMap: Record<string, { bg: string; text: string; label: string }> = {
  create: { bg: 'bg-green-100', text: 'text-green-800', label: 'create' },
  add:    { bg: 'bg-green-100', text: 'text-green-800', label: 'create' },
  modify: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'modify' },
  change: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'modify' },
  delete: { bg: 'bg-red-100', text: 'text-red-800', label: 'delete' },
  unlink: { bg: 'bg-red-100', text: 'text-red-800', label: 'delete' },
  warning:{ bg: 'bg-yellow-100',text: 'text-yellow-800',label: 'warning' },
};

export const Badge: React.FC<BadgeProps> = ({ type, label, className = '' }) => {
  const t = typeMap[type] ?? { bg: 'bg-noir-05', text: 'text-noir-50', label: type };
  return (
    <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full lowercase font-medium ${t.bg} ${t.text} ${className}`}>
      {label ?? t.label}
    </span>
  );
};
