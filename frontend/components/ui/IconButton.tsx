'use client';

import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style */
  variant?: 'ghost' | 'surface' | 'primary';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', className = '', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center shrink-0 rounded-smart transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-signature/60 focus-visible:ring-offset-1 focus-visible:ring-offset-smartBg disabled:opacity-40 disabled:pointer-events-none';

    const variants: Record<NonNullable<IconButtonProps['variant']>, string> = {
      ghost:
        'text-smartTextSecondary hover:text-smartTextPrimary hover:bg-smartSurface/70 active:bg-smartSurface active:scale-[0.94]',
      surface:
        'bg-smartSurface border border-smartBorder text-smartTextPrimary hover:bg-smartElevated active:scale-[0.94]',
      primary:
        'bg-signature text-smartBg hover:bg-signature/90 active:scale-[0.94]',
    };

    const sizes: Record<NonNullable<IconButtonProps['size']>, string> = {
      sm: 'h-7 w-7',
      md: 'h-9 w-9',
      lg: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant ?? 'ghost']} ${sizes[size ?? 'md']} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
