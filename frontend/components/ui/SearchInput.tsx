'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchInput — text input with a search icon and clear button.
 *
 * Design-system page passes native React.ChangeEvent<HTMLInputElement> to onChange,
 * so this component exposes the full native input interface.
 */
export type SearchInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  /** Called when the clear (×) button is clicked */
  onClear?: () => void;
};

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, className = '', placeholder = 'Search…', value, onChange, ...props }, ref) => {
    const hasValue = Boolean(value);

    const handleClear = () => {
      // Fire a synthetic change event so state management stays consistent
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      // Fallback: just call onClear, let parent clear state
      onClear?.();
    };

    return (
      <div className={`relative flex items-center w-full ${className}`}>
        {/* Leading search icon */}
        <Search
          aria-hidden="true"
          className="absolute left-3 h-3.5 w-3.5 text-smartTextSecondary pointer-events-none shrink-0"
        />

        <input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-9 bg-smartSurface border border-smartBorder rounded-smart pl-9 pr-8 text-sm font-sans text-smartTextPrimary placeholder:text-smartTextSecondary/45 outline-none focus:border-signature/60 transition-colors duration-150 [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />

        {/* Clear button — only shown when input has a value */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 flex h-4 w-4 items-center justify-center text-smartTextSecondary hover:text-smartTextPrimary transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
