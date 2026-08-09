'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export type ParkingSlotState = 'AVAILABLE' | 'LIMITED' | 'OCCUPIED' | 'SELECTED' | 'RESERVED';

export interface ParkingSlotProps {
  id: string;
  state: ParkingSlotState;
  onClick?: (id: string) => void;
  className?: string;
}

// Highly polished, premium technical top-down vehicle wireframe
const VehicleSilhouette: React.FC = () => (
  <svg
    viewBox="0 0 32 64"
    className="w-10 h-20 text-smartTextSecondary/30 fill-none stroke-current stroke-1 animate-fade-in"
    aria-hidden="true"
  >
    {/* Outer chassis */}
    <rect x="4" y="4" width="24" height="56" rx="6" className="stroke-smartTextSecondary/30" />
    
    {/* Bumpers */}
    <path d="M 6 4 L 26 4" className="stroke-smartTextSecondary/40" />
    <path d="M 6 60 L 26 60" className="stroke-smartTextSecondary/40" />

    {/* Front windshield & hood */}
    <path d="M 6 18 L 26 18 M 6 18 C 6 12, 26 12, 26 18" className="stroke-smartTextSecondary/35" />
    <path d="M 10 12 L 22 12" className="stroke-smartTextSecondary/20" />

    {/* Rear window & trunk */}
    <path d="M 7 46 L 25 46 M 7 46 C 7 49, 25 49, 25 46" className="stroke-smartTextSecondary/35" />

    {/* Roof contour lines */}
    <rect x="7" y="19" width="18" height="26" rx="3" className="stroke-smartTextSecondary/15" />

    {/* Side mirrors */}
    <rect x="1.5" y="15" width="2.5" height="5" rx="1.2" className="fill-smartTextSecondary/25 stroke-none" />
    <rect x="28" y="15" width="2.5" height="5" rx="1.2" className="fill-smartTextSecondary/25 stroke-none" />

    {/* Wheels (front/rear, left/right) */}
    <rect x="2.5" y="8" width="1.5" height="7" rx="1" className="fill-smartTextSecondary/20 stroke-none" />
    <rect x="28" y="8" width="1.5" height="7" rx="1" className="fill-smartTextSecondary/20 stroke-none" />
    <rect x="2.5" y="44" width="1.5" height="7" rx="1" className="fill-smartTextSecondary/20 stroke-none" />
    <rect x="28" y="44" width="1.5" height="7" rx="1" className="fill-smartTextSecondary/20 stroke-none" />
  </svg>
);

export const ParkingSlot: React.FC<ParkingSlotProps> = ({
  id,
  state,
  onClick,
  className = '',
}) => {
  const isInteractive = !!onClick && state !== 'OCCUPIED';

  const stateConfigs = {
    AVAILABLE: {
      borderColor: 'border-available/40',
      textColor: 'text-available',
      bg: 'hover:bg-available/5 bg-smartBg/30',
      label: 'Available',
    },
    LIMITED: {
      borderColor: 'border-limited/40',
      textColor: 'text-limited',
      bg: 'hover:bg-limited/5 bg-smartBg/30',
      label: 'Limited',
    },
    OCCUPIED: {
      borderColor: 'border-smartBorder/30',
      textColor: 'text-smartTextSecondary/50',
      bg: 'bg-smartSurface/40',
      label: 'Occupied',
    },
    SELECTED: {
      borderColor: 'border-signature',
      textColor: 'text-signature',
      bg: 'bg-signature/10',
      label: 'Selected',
    },
    RESERVED: {
      borderColor: 'border-aiBlue/50',
      textColor: 'text-aiBlue',
      bg: 'bg-aiBlue/10',
      label: 'Reserved',
    },
  };

  const current = stateConfigs[state];

  return (
    <motion.button
      type="button"
      onClick={() => isInteractive && onClick && onClick(id)}
      disabled={state === 'OCCUPIED'}
      whileHover={isInteractive ? { scale: 1.02 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      className={`relative flex flex-col items-center justify-between py-2.5 h-28 w-16 border-x-2 border-dashed ${
        current.borderColor
      } ${current.bg} transition-all duration-200 select-none focus:outline-none focus:border-x-solid focus:border-signature ${className}`}
      aria-label={`Parking slot ${id}, status: ${current.label}`}
    >
      {/* Infrastructure-style grid background for the bay */}
      <div className="absolute inset-0 spatial-grid-dots opacity-10 pointer-events-none" />

      {/* Top identifier label */}
      <span className="font-mono text-[10px] font-bold text-smartTextSecondary tracking-widest bg-smartBg border border-smartBorder/50 px-1 py-0.5 rounded-smart-sm z-10">
        {id}
      </span>

      {/* Center bay content */}
      <div className="flex items-center justify-center flex-1 w-full min-h-[64px] z-10">
        {state === 'OCCUPIED' ? (
          <VehicleSilhouette />
        ) : state === 'SELECTED' ? (
          <div className="flex flex-col items-center gap-1.5 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-signature ring-4 ring-signature/20" />
            <span className="text-[7.5px] font-bold text-signature uppercase tracking-widest font-sans">
              ACTIVE
            </span>
          </div>
        ) : state === 'RESERVED' ? (
          <div className="flex flex-col items-center gap-1.5 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-aiBlue ring-4 ring-aiBlue/20 animate-pulse" />
            <span className="text-[7.5px] font-bold text-aiBlue uppercase tracking-widest font-sans">
              RESERVED
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${state === 'AVAILABLE' ? 'bg-available' : 'bg-limited'}`} />
            <span className="text-[7.5px] font-mono text-smartTextSecondary uppercase tracking-widest">
              BAY
            </span>
          </div>
        )}
      </div>

      {/* Lane limits / stop stripe at the bottom of the slot */}
      <div className="w-full px-1 z-10 flex flex-col items-center gap-0.5">
        <div className={`h-[2px] w-4/5 rounded-full ${state === 'SELECTED' ? 'bg-signature/40' : 'bg-smartBorder/40'}`} />
        <span className="text-[6.5px] font-mono text-smartTextSecondary/40 uppercase tracking-widest">
          LANE IN
        </span>
      </div>
    </motion.button>
  );
};

ParkingSlot.displayName = 'ParkingSlot';
