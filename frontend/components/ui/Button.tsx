'use client';

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinner and disables the button */
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-150 select-none rounded-smart focus:outline-none focus-visible:ring-2 focus-visible:ring-signature/60 focus-visible:ring-offset-1 focus-visible:ring-offset-smartBg disabled:opacity-40 disabled:pointer-events-none';

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-signature text-smartBg hover:bg-signature/90 active:scale-[0.98] active:bg-signature/80',
      secondary:
        'bg-smartSurface border border-smartBorder text-smartTextPrimary hover:bg-smartElevated hover:border-smartBorder/60 active:scale-[0.98]',
      ghost:
        'bg-transparent text-smartTextSecondary hover:text-smartTextPrimary hover:bg-smartSurface/70 active:bg-smartSurface active:scale-[0.98]',
      danger:
        'bg-occupied/10 border border-occupied/30 text-occupied hover:bg-occupied/20 active:scale-[0.98]',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'text-xs px-3 py-1.5 h-7',
      md: 'text-sm px-4 py-2 h-9',
      lg: 'text-sm px-5 py-2.5 h-10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant ?? 'primary']} ${sizes[size ?? 'md']} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin shrink-0"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
