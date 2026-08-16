'use client';

import * as React from 'react';
import { Header } from '../../components/ui/Header';
import { LoadingSkeleton, LoadingCard } from '../../components/ui/LoadingSkeleton';

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        <div className="flex flex-col gap-2 pb-6 border-b border-smartBorder/60">
          <LoadingSkeleton variant="rect" height={24} width={190} />
          <LoadingSkeleton variant="rect" height={16} width={360} />
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <LoadingSkeleton variant="circle" width={80} height={30} />
            <LoadingSkeleton variant="circle" width={80} height={30} />
            <LoadingSkeleton variant="circle" width={80} height={30} />
          </div>
          <div className="space-y-3">
            <LoadingSkeleton variant="rect" height={70} className="w-full" />
            <LoadingSkeleton variant="rect" height={70} className="w-full" />
            <LoadingSkeleton variant="rect" height={70} className="w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
