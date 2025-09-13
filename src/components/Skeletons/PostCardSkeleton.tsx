export default function PostCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <div className="h-40 w-full bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
    </div>
  );
}

