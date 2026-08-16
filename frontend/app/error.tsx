'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log the error locally for prototype testing debug
    console.error('Captured by SmartPark Global Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col items-center justify-center font-sans px-4 selection:bg-signature/20 selection:text-signature">
      
      <Card variant="elevated" className="max-w-md w-full border-occupied/35 p-6 text-center space-y-6 shadow-2xl">
        
        {/* Error icon circle */}
        <div className="mx-auto h-12 w-12 rounded-full bg-occupied/15 border border-occupied/35 flex items-center justify-center text-occupied">
          <AlertCircle className="h-6 w-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-base font-bold font-display uppercase tracking-wider text-smartTextPrimary">
            Something went wrong.
          </h1>
          <p className="text-xs text-smartTextSecondary leading-relaxed">
            The SmartPark interface encountered an unexpected runtime problem. Telemetry streams have isolated this session to preserve state safety.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-1/2 text-xs justify-center gap-1.5 h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            TRY AGAIN
          </Button>

          <Link href="/" className="w-full sm:w-1/2">
            <Button
              variant="secondary"
              className="w-full text-xs justify-center gap-1.5 h-9"
            >
              <Home className="h-3.5 w-3.5 text-signature" />
              RETURN HOME
            </Button>
          </Link>
        </div>

      </Card>

      {/* Security footer */}
      <div className="mt-8 text-[9px] font-mono text-smartTextSecondary/40">
        SMARTPARK TELEMETRY DECK · SESSION_SANDBOX_ACTIVE
      </div>

    </div>
  );
}
