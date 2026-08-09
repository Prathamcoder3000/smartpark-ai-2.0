'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Select — styled native <select> element.
 *
 * Design-system page passes a native synthetic event to onChange:
 *   onChange={(e) => setSelectValue(e.target.value)}
 * So we extend the standard React.SelectHTMLAttributes to preserve this contract.
 */
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, placeholder, className = '', id, ...props }, ref) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const uid = React.useId();
    const selectId = id ?? uid;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className="w-full h-9 appearance-none bg-smartSurface border border-smartBorder rounded-smart px-3 pr-8 text-sm font-sans text-smartTextPrimary outline-none focus:border-signature/60 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-smartElevated text-smartTextPrimary"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-smartTextSecondary"
          />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
