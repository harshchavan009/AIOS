import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';

export const SkeletonCard: React.FC<{ height?: string }> = ({ height = 'h-36' }) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div
      className={`rounded-2xl p-6 border animate-pulse space-y-3 ${
        isLight
          ? 'bg-gray-100/80 border-gray-200'
          : 'bg-[#0E121B]/80 border-white/10'
      } ${height}`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-xl ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
        <div className="space-y-1.5 flex-1">
          <div className={`h-3 w-1/3 rounded ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
          <div className={`h-2.5 w-1/2 rounded ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
        </div>
      </div>
      <div className={`h-4 w-3/4 rounded mt-4 ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
      <div className={`h-3 w-1/2 rounded ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div
      className={`rounded-3xl p-6 border space-y-4 animate-pulse ${
        isLight ? 'bg-white border-gray-200' : 'bg-[#0E121B] border-white/10'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className={`h-4 w-40 rounded ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
        <div className={`h-6 w-20 rounded-full ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`w-3.5 h-3.5 rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
              <div className={`h-3.5 w-1/3 rounded ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
            </div>
            <div className={`h-3 w-20 rounded ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const PageSkeletonLoader: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div className="space-y-8 animate-fade-in font-sans p-2">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <div className={`h-7 w-64 rounded-xl ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
          <div className={`h-3.5 w-96 rounded-lg ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
        </div>
        <div className="flex items-center space-x-3">
          <div className={`h-8 w-28 rounded-xl ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
          <div className={`h-8 w-36 rounded-xl ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table Skeleton */}
      <SkeletonTable rows={6} />
    </div>
  );
};
