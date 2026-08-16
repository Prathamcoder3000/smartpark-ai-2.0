'use client';

import * as React from 'react';
import { Header } from '../../components/ui/Header';
import { LoadingSkeleton, LoadingCard } from '../../components/ui/LoadingSkeleton';

export default function OperatorLoading() {
  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        <div className="flex flex-col gap-2 pb-6 border-b border-smartBorder/60">
          <LoadingSkeleton variant="rect" height={24} width={180} />
          <LoadingSkeleton variant="rect" height={16} width={310} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <LoadingSkeleton variant="rect" height={150} className="w-full" />
            <LoadingSkeleton variant="rect" height={100} className="w-full" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <LoadingSkeleton variant="rect" height={350} className="w-full animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
