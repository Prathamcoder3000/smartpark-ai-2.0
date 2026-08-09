'use client';

import * as React from 'react';
import { Sparkles, Check, Clock, TrendingUp, Navigation, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { IconButton } from './IconButton';

export interface AIInsightProps {
  title?: string;
  recommendation?: string;
  confidence?: number | string;
  durationMinutes?: number | string;
  ratePerHour?: string;
  demandTrend?: string;
  reasons?: string[];
  onAction?: () => void;
  actionText?: string;
}

export const AIInsight: React.FC<AIInsightProps> = ({
  title = 'Central Plaza',
  recommendation = 'Best option based on arrival time & price.',
  confidence = '92%',
  durationMinutes = '8 min away',
  ratePerHour = '₹30/hr',
  demandTrend = 'Demand is expected to rise 18% in the next 45 minutes.',
  reasons = [
    'High availability confidence',
    'Low predicted congestion',
    'Short walking distance to destination',
  ],
  onAction,
  actionText = 'Reserve Spot',
}) => {
  return (
    <Card variant="elevated" className="relative overflow-hidden border border-smartBorder select-none">
      {/* Decorative intelligence-inspired accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-aiBlue via-signature to-transparent" />
      
      {/* Spatial grid dot pattern in card background */}
      <div className="absolute inset-0 spatial-grid-dots opacity-10 pointer-events-none" />

      <div className="flex flex-col gap-5 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-aiBlue animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-aiBlue uppercase">
              SMARTPARK INTELLIGENCE
            </span>
          </div>
          <span className="text-[8px] font-mono bg-smartBg border border-smartBorder px-2 py-0.5 rounded text-smartTextSecondary">
            PREDICTIVE MODEL V2.0
          </span>
        </div>

        {/* Spot Details */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono bg-signature/10 border border-signature/30 text-signature px-1.5 py-0.5 rounded uppercase font-semibold">
              BEST OPTION
            </span>
          </div>
          <h3 className="text-xl font-display font-semibold text-smartTextPrimary mt-1.5">
            {title}
          </h3>
          <p className="text-xs text-smartTextSecondary mt-1 leading-relaxed">
            {recommendation}
          </p>
        </div>

        {/* Prediction Metrics Columns */}
        <div className="grid grid-cols-3 gap-2 border-y border-smartBorder/60 py-3.5 bg-smartBg/30 rounded px-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary font-sans">
              Confidence
            </span>
            <span className="font-mono text-base font-bold text-signature">
              {confidence}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary font-sans">
              Distance
            </span>
            <span className="font-mono text-base font-bold text-smartTextPrimary">
              {durationMinutes}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary font-sans">
              Rate
            </span>
            <span className="font-mono text-base font-bold text-smartTextPrimary">
              {ratePerHour}
            </span>
          </div>
        </div>

        {/* Why this spot list */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
            WHY THIS SPOT
          </span>
          <ul className="flex flex-col gap-2" role="list">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-smartTextSecondary">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-signature/10 border border-signature/30 shrink-0 mt-0.5">
                  <Check className="h-2.5 w-2.5 text-signature" />
                </span>
                <span className="font-sans leading-relaxed text-smartTextPrimary/90">
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Demand Trend Alert */}
        {demandTrend && (
          <div className="flex items-start gap-2.5 text-[11px] bg-smartBg/60 border border-smartBorder/40 p-2.5 rounded-smart text-smartTextSecondary">
            <TrendingUp className="h-3.5 w-3.5 text-limited shrink-0 mt-0.5" />
            <span className="font-sans leading-relaxed">
              {demandTrend}
            </span>
          </div>
        )}

        {/* Booking Trigger Bar */}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="primary" onClick={onAction} className="flex-1 text-xs uppercase tracking-wider font-semibold font-sans h-9">
            {actionText}
          </Button>
          <IconButton variant="surface" className="h-9 w-9" title="Begin Route Navigation">
            <Navigation className="h-4 w-4 text-smartTextPrimary" />
          </IconButton>
        </div>
      </div>
    </Card>
  );
};

AIInsight.displayName = 'AIInsight';
