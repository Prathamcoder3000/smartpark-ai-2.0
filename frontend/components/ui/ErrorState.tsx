'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System error occurred',
  description = 'We encountered an error loading the live metrics feed. Please check your connection.',
  error,
  onRetry,
  retryText = 'Retry Connection',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-red-500/20 rounded-smart-lg bg-red-950/10 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-sm font-semibold font-display text-red-400 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-smartTextSecondary max-w-xs leading-relaxed mb-5">
        {description}
      </p>
      {error && (
        <pre className="text-[10px] font-mono text-red-400 bg-red-950/20 border border-red-500/10 p-2 rounded mb-5 max-w-md overflow-x-auto">
          {typeof error === 'string' ? error : error.message}
        </pre>
      )}
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
};

ErrorState.displayName = 'ErrorState';
