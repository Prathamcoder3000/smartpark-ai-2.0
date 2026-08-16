'use client';

import * as React from 'react';
import { Header } from '../../../components/ui/Header';
import { LoadingSkeleton, LoadingCard } from '../../../components/ui/LoadingSkeleton';

export default function FacilityDetailsLoading() {
  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        <div className="flex flex-col gap-2 pb-6 border-b border-smartBorder/60 animate-pulse">
          <LoadingSkeleton variant="rect" height={12} width={120} />
          <LoadingSkeleton variant="rect" height={24} width={280} />
        </div>

        <div className="space-y-6">
          {/* Hero skeleton */}
          <LoadingSkeleton variant="rect" height={160} className="w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <LoadingCard />
            </div>
            <div className="space-y-4">
              <LoadingSkeleton variant="rect" height={140} className="w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
