'use client';

import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label above the input */
  label?: string;
  /** Inline validation error message (replaces helperText) */
  error?: string;
  /** Subtle hint text below the input */
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    // Stable ID for label association (suppressed exhaustive-deps lint — intentional)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const uid = React.useId();
    const inputId = id ?? uid;

    const borderClass = error
      ? 'border-occupied/50 focus:border-occupied/80'
      : 'border-smartBorder focus:border-signature/60';

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`w-full h-9 bg-smartSurface border ${borderClass} rounded-smart px-3 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/45 outline-none transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
          {...props}
        />

        {error && (
          <p className="text-[11px] font-sans text-occupied">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] font-sans text-smartTextSecondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
