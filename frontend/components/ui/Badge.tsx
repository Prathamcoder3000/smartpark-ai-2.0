import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Semantic variant:
   * - default   → neutral muted
   * - outline   → borderless, transparent bg
   * - signature → Electric Lime accent (SmartPark brand)
   * - ai        → AI blue accent
   * - available → green status
   * - limited   → amber status
   * - occupied  → red status
   */
  variant?: 'default' | 'outline' | 'signature' | 'ai' | 'available' | 'limited' | 'occupied';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
      default: 'bg-smartElevated border border-smartBorder text-smartTextSecondary',
      outline: 'bg-transparent border border-smartBorder/70 text-smartTextSecondary',
      signature: 'bg-signature/10 border border-signature/30 text-signature',
      ai: 'bg-aiBlue/10 border border-aiBlue/30 text-aiBlue',
      available: 'bg-available/10 border border-available/30 text-available',
      limited: 'bg-limited/10 border border-limited/30 text-limited',
      occupied: 'bg-occupied/10 border border-occupied/30 text-occupied',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-smart-sm ${variants[variant ?? 'default']} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
