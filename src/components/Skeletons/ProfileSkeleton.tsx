export default function ProfileSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

