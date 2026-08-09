'use client';

import * as React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active entries',
  description = 'You do not have any bookings scheduled at this time.',
  icon = <Inbox className="h-8 w-8 text-smartTextSecondary" />,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-smartBorder rounded-smart-lg bg-smartSurface/20 ${className}`}>
      <div className="h-12 w-12 rounded-full bg-smartSurface border border-smartBorder flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold font-display text-smartTextPrimary uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-smartTextSecondary max-w-xs leading-relaxed mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
