'use client';

export default function CommentSkeleton() {
  return (
    <div className="flex gap-3 md:gap-4 p-4 md:p-6 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 animate-pulse">
      {/* Avatar skeleton */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          <div className="h-8 w-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
