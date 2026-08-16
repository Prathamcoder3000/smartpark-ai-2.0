'use client';

import * as React from 'react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col items-center justify-center font-sans px-4 select-none pointer-events-none">
      
      {/* Polished, lightweight signature pulse animation */}
      <div className="relative mb-6">
        <div className="h-10 w-10 rounded-full border border-smartBorder flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-signature animate-ping absolute" />
          <div className="h-2 w-2 rounded-full bg-signature" />
        </div>
      </div>

      <div className="space-y-1.5 text-center">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-smartTextPrimary">
          SmartPark<span className="text-signature">.</span>AI
        </span>
        <p className="text-[10px] font-mono text-smartTextSecondary uppercase tracking-wider animate-pulse">
          Loading SmartPark...
        </p>
        <p className="text-[8px] font-mono text-smartTextSecondary/40 max-w-[180px] mx-auto">
          synchronizing dynamic sensors & predictive models
        </p>
      </div>

    </div>
  );
}
