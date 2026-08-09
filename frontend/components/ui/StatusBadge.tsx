import * as React from 'react';

/** Parking / facility availability status types */
export type ParkingStatusType = 'AVAILABLE' | 'LIMITED' | 'OCCUPIED' | 'CLOSED' | 'RESERVED';

export interface StatusBadgeProps {
  status: ParkingStatusType;
  /** Show the animated indicator dot */
  showDot?: boolean;
  className?: string;
}

interface StatusConfig {
  dot: string;
  text: string;
  container: string;
  label: string;
  pulse: boolean;
}

const STATUS_CONFIGS: Record<ParkingStatusType, StatusConfig> = {
  AVAILABLE: {
    dot: 'bg-available',
    text: 'text-available',
    container: 'bg-available/10 border-available/30',
    label: 'Available',
    pulse: true,
  },
  LIMITED: {
    dot: 'bg-limited',
    text: 'text-limited',
    container: 'bg-limited/10 border-limited/30',
    label: 'Limited',
    pulse: false,
  },
  OCCUPIED: {
    dot: 'bg-occupied',
    text: 'text-occupied',
    container: 'bg-occupied/10 border-occupied/30',
    label: 'Occupied',
    pulse: false,
  },
  CLOSED: {
    dot: 'bg-smartTextSecondary',
    text: 'text-smartTextSecondary',
    container: 'bg-smartSurface border-smartBorder',
    label: 'Closed',
    pulse: false,
  },
  RESERVED: {
    dot: 'bg-aiBlue',
    text: 'text-aiBlue',
    container: 'bg-aiBlue/10 border-aiBlue/30',
    label: 'Reserved',
    pulse: true,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
}) => {
  const cfg = STATUS_CONFIGS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-smart-sm border ${cfg.container} ${cfg.text} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {cfg.label}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';
