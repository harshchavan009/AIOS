import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] border border-white/[0.04] relative overflow-hidden ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`glass-card p-5 rounded-2xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
};

export const PageSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading Module...' }) => {
  return (
    <div className="space-y-8 animate-fade-in font-sans p-2">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 md:w-96" />
          <Skeleton className="h-4 w-80 md:w-[32rem]" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Main Content / Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <div className="h-64 w-full flex flex-col justify-end space-y-2 p-2">
            <div className="flex items-end space-x-3 h-48">
              <Skeleton className="h-3/4 w-full rounded-t-lg" />
              <Skeleton className="h-1/2 w-full rounded-t-lg" />
              <Skeleton className="h-full w-full rounded-t-lg" />
              <Skeleton className="h-2/3 w-full rounded-t-lg" />
              <Skeleton className="h-4/5 w-full rounded-t-lg" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <div className="h-64 w-full flex flex-col justify-end space-y-2 p-2">
            <div className="flex items-end space-x-3 h-48">
              <Skeleton className="h-1/2 w-full rounded-t-lg" />
              <Skeleton className="h-4/5 w-full rounded-t-lg" />
              <Skeleton className="h-2/3 w-full rounded-t-lg" />
              <Skeleton className="h-full w-full rounded-t-lg" />
              <Skeleton className="h-3/5 w-full rounded-t-lg" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
