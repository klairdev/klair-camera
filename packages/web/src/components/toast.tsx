import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const colors = {
  success: { bg: 'bg-green-50', border: 'border-green-deep', text: 'text-green-deep' },
  error:   { bg: 'bg-red-50',   border: 'border-signal',    text: 'text-signal' },
  info:    { bg: 'bg-noir-05',   border: 'border-noir-20',   text: 'text-structure' },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const c = colors[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto px-4 py-2.5 rounded-2xl border shadow-lg ${c.bg} ${c.border} flex items-center gap-2`}
            >
              <span className={`text-xs font-medium lowercase ${c.text}`}>
                {toast.message}
              </span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-noir-30 hover:text-structure transition-colors lowercase text-xs ml-2"
              >
                dismiss
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

let _toastId = 0;
export function createToast(type: Toast['type'], message: string): Toast {
  return { id: 't' + (++_toastId), type, message };
}
