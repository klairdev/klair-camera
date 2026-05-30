import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './animations';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center font-semibold uppercase tracking-wide transition-all duration-200 rounded-lg select-none';

const variants: Record<string, string> = {
  primary: 'bg-signal text-white hover:bg-red-800 hover:shadow-lg active:bg-red-900 disabled:bg-red-20 disabled:text-red-50',
  secondary: 'bg-white border-2 border-signal text-signal hover:bg-red-50 active:bg-red-100 disabled:opacity-40',
  ghost: 'bg-transparent border border-noir-10 text-structure hover:bg-noir-05 active:bg-noir-10 disabled:opacity-40',
  danger: 'bg-red-10 text-signal hover:bg-red-20 active:bg-red-30 disabled:opacity-40',
};

const sizes: Record<string, string> = {
  sm: 'px-4 py-2 text-[11px] gap-1.5',
  md: 'px-6 py-2.5 text-[13px] gap-2',
  lg: 'px-8 py-3 text-sm gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon,
  onClick,
  fullWidth = false,
}) => {
  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <LoadingSpinner size={14} />
      ) : icon ? (
        <span className="text-base">{icon}</span>
      ) : null}
      {loading ? 'loading...' : children}
    </motion.button>
  );
};
