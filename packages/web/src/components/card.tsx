import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'alert' | 'dark' | 'highlight' | 'data';
  hover?: boolean;
  padding?: string;
  onClick?: () => void;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white border border-sidebar',
  alert: 'bg-white border-l-4 border-signal',
  dark: 'bg-structure text-white border border-structure',
  highlight: 'bg-white border-2 border-yellow',
  data: 'bg-gradient-to-br from-white to-linen border border-sidebar',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'p-6',
  onClick,
}) => {
  const base = `${variantStyles[variant]} rounded-card ${padding} shadow-sm ${className}`;
  const interactive = hover || onClick ? 'cursor-pointer' : '';

  if (hover) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`${base} ${interactive}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${interactive}`} onClick={onClick}>
      {children}
    </div>
  );
};
