import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'number';
  className?: string;
  mono?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  type = 'text',
  className = '',
  mono = false,
  error,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-noir-50 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-30 text-sm pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors
            focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal/20
            ${error ? 'border-signal' : 'border-noir-10 hover:border-noir-20'}
            ${mono ? 'font-mono' : 'font-sans'}
            ${icon ? 'pl-9' : ''}
            placeholder:text-noir-30`}
        />
      </div>
      {error && (
        <p className="text-[11px] text-signal mt-1 lowercase">{error}</p>
      )}
    </div>
  );
};
