'use client';

import * as React from 'react';
import { Header } from '../../components/ui/Header';
import { LoadingSkeleton, LoadingCard } from '../../components/ui/LoadingSkeleton';

export default function MapLoading() {
  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        <div className="flex flex-col gap-2 pb-6 border-b border-smartBorder/60">
          <LoadingSkeleton variant="rect" height={24} width={150} />
          <LoadingSkeleton variant="rect" height={16} width={250} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
          <div className="md:col-span-2 bg-smartSurface/50 border border-smartBorder/45 rounded-smart animate-pulse" />
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
          </div>
        </div>
      </main>
    </div>
  );
}
