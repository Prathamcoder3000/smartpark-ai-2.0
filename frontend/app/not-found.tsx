'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, MapPin, Search, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col items-center justify-center font-sans px-4 selection:bg-signature/20 selection:text-signature">
      
      {/* Visual wireframe circle */}
      <div className="h-20 w-20 rounded-full bg-limited/10 border border-limited/30 flex items-center justify-center mb-6 text-limited animate-pulse">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <div className="space-y-2 text-center max-w-sm">
        <h1 className="text-4xl font-extrabold font-mono text-signature tracking-widest">
          404
        </h1>
        <h2 className="text-base font-bold font-display uppercase tracking-wider text-smartTextPrimary">
          Parking route not found.
        </h2>
        <p className="text-xs text-smartTextSecondary leading-relaxed">
          The destination you're looking for doesn't exist, may have moved, or is temporarily offline.
        </p>
      </div>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-col gap-3.5 w-full max-w-xs">
        <Link href="/" className="w-full">
          <Button variant="primary" className="w-full text-xs justify-center gap-1.5 h-10">
            BACK TO SMARTPARK
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/search" className="w-full">
            <Button variant="secondary" className="w-full text-[10px] justify-center gap-1 h-9">
              <Search className="h-3.5 w-3.5 text-signature" />
              FIND PARKING
            </Button>
          </Link>
          
          <Link href="/map" className="w-full">
            <Button variant="secondary" className="w-full text-[10px] justify-center gap-1 h-9">
              <MapPin className="h-3.5 w-3.5 text-signature" />
              VIEW LIVE MAP
            </Button>
          </Link>
        </div>
      </div>

      {/* Terminal brand signature */}
      <div className="mt-12 text-[9px] font-mono text-smartTextSecondary/40">
        SMARTPARK AI PLATFORM v2.0.0 · NODE_ERROR_404
      </div>

    </div>
  );
}
