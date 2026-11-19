import React from 'react';

export type SkeletonVariant = 'text' | 'circle' | 'card' | 'tableRow';

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (variant === 'circle') {
    return (
      <div className="flex items-center space-x-2">
        {items.map((_, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full bg-slate-200/80 animate-pulse ${className}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'tableRow') {
    return (
      <div className="space-y-3 p-4">
        {items.map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-5 h-5 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded flex-1" />
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div
            key={i}
            className={`bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse ${className}`}
          >
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-200 rounded animate-pulse ${className}`}
        />
      ))}
    </div>
  );
};

