import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual layer:
   * - default  → surface level (#111519)
   * - elevated → raised level (#181D21)
   * - outlined → transparent, border only
   * - flat     → transparent, no border (used as layout wrapper)
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  /** Inner padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', className = '', children, ...props },
    ref
  ) => {
    const variants: Record<NonNullable<CardProps['variant']>, string> = {
      default: 'bg-smartSurface border border-smartBorder',
      elevated: 'bg-smartElevated border border-smartBorder/70',
      outlined: 'bg-transparent border border-smartBorder',
      flat: 'bg-transparent border-0',
    };

    const paddings: Record<NonNullable<CardProps['padding']>, string> = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`rounded-smart ${variants[variant ?? 'default']} ${paddings[padding ?? 'md']} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
