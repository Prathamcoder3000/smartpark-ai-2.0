import * as React from 'react';

export interface MetricProps {
  /** Short descriptive label */
  label: string;
  /** Primary numeric or text value */
  value: string | number;
  /** Optional unit suffix displayed smaller beside the value */
  unit?: string;
  /** Optional delta/trend indicator */
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

const TREND_COLORS: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-available',
  down: 'text-occupied',
  neutral: 'text-smartTextSecondary',
};

const TREND_ICONS: Record<'up' | 'down' | 'neutral', string> = {
  up: '↑',
  down: '↓',
  neutral: '—',
};

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  trend,
  className = '',
}) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary">
      {label}
    </span>

    <div className="flex items-baseline gap-1">
      <span className="font-mono text-2xl font-bold text-smartTextPrimary leading-none">
        {value}
      </span>
      {unit && (
        <span className="text-[11px] font-mono text-smartTextSecondary leading-none">
          {unit}
        </span>
      )}
    </div>

    {trend && (
      <span
        className={`text-[10px] font-sans font-medium ${TREND_COLORS[trend.direction]}`}
      >
        <span aria-hidden="true">{TREND_ICONS[trend.direction]} </span>
        {trend.value}
      </span>
    )}
  </div>
);

Metric.displayName = 'Metric';
