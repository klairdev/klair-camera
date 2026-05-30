import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        {label && <div className="text-sm text-structure lowercase font-medium">{label}</div>}
        {description && <div className="text-[11px] text-noir-50 lowercase mt-0.5">{description}</div>}
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        type="button"
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${checked ? 'bg-signal' : 'bg-noir-10'}`}
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
};
