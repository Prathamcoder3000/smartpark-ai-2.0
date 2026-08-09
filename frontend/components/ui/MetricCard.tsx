import * as React from 'react';
import { Card } from './Card';
import { Metric, MetricProps } from './Metric';

export type MetricCardProps = MetricProps & {
  /** Optional icon displayed top-right in a small container */
  icon?: React.ReactNode;
  className?: string;
};

/**
 * MetricCard — wraps Metric inside a Card.
 *
 * Design-system page usage:
 *   <MetricCard label="Available Spaces" value="42" trend={{ value: '+4', direction: 'up' }} unit="/ 120" />
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  className = '',
  label,
  value,
  unit,
  trend,
}) => (
  <Card variant="default" className={`flex flex-col gap-3 ${className}`}>
    <div className="flex items-start justify-between gap-2">
      <Metric label={label} value={value} unit={unit} trend={trend} />
      {icon && (
        <div className="shrink-0 h-8 w-8 rounded-smart-sm bg-smartElevated border border-smartBorder flex items-center justify-center text-smartTextSecondary">
          {icon}
        </div>
      )}
    </div>
  </Card>
);

MetricCard.displayName = 'MetricCard';
