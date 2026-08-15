'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PredictionsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/intelligence');
  }, [router]);

  return (
    <div className="min-h-screen bg-smartBg flex items-center justify-center font-mono text-xs text-smartTextSecondary">
      Redirecting to Intelligence Workspace...
    </div>
  );
}
