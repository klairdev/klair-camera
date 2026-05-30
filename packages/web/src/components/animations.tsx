import React from 'react';
import { motion, type Variants } from 'framer-motion';

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

export const spinTransition = { repeat: Infinity, duration: 1, ease: 'linear' } as const;

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <motion.div
    className={`border-2 border-noir-10 border-t-noir rounded-full ${className}`}
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={spinTransition}
  />
);
