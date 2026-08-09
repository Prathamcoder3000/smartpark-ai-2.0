'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { IconButton } from './IconButton';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  type = 'success',
  onClose,
  duration = 4000,
}) => {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-4.5 w-4.5 text-available" />,
    warning: <AlertTriangle className="h-4.5 w-4.5 text-limited" />,
    error: <AlertTriangle className="h-4.5 w-4.5 text-occupied" />,
    info: <Info className="h-4.5 w-4.5 text-aiBlue" />,
  };

  const borders = {
    success: 'border-available/30',
    warning: 'border-limited/30',
    error: 'border-occupied/30',
    info: 'border-aiBlue/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto flex items-center gap-3 bg-smartElevated border ${borders[type]} px-4 py-3 rounded-smart shadow-2xl max-w-sm`}
            role="alert"
          >
            <div className="shrink-0">{icons[type]}</div>
            <div className="flex-1 text-xs font-sans font-medium text-smartTextPrimary">
              {message}
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 text-smartTextSecondary hover:text-smartTextPrimary"
              aria-label="Close notification"
            >
              <X className="h-3 w-3" />
            </IconButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Toast.displayName = 'Toast';
