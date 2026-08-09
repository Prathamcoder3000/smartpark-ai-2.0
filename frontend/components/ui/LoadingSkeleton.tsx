'use client';

import * as React from 'react';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-3 w-4/5 rounded-smart-sm';
      case 'circle':
        return 'rounded-full';
      default:
        return 'rounded-smart';
    }
  };

  const customStyle: React.CSSProperties = {
    width: width,
    height: height,
    ...style,
  };

  return (
    <div
      className={`animate-pulse bg-smartElevated border border-smartBorder/35 ${getVariantStyles()} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};

export const LoadingCard: React.FC = () => (
  <div className="border border-smartBorder bg-smartSurface p-5 rounded-smart flex flex-col gap-4 w-full">
    <div className="flex items-center gap-3">
      <LoadingSkeleton variant="circle" width={40} height={40} />
      <div className="flex flex-col gap-1.5 flex-1">
        <LoadingSkeleton variant="rect" height={12} width="40%" />
        <LoadingSkeleton variant="rect" height={10} width="20%" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <LoadingSkeleton variant="text" />
      <LoadingSkeleton variant="text" width="90%" />
      <LoadingSkeleton variant="text" width="60%" />
    </div>
  </div>
);

LoadingSkeleton.displayName = 'LoadingSkeleton';
