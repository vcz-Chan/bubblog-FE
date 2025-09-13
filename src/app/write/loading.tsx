import PostCardSkeleton from "@/components/Skeletons/PostCardSkeleton";

export default function Loading() {
  return (
    <div className="w-full p-6 lg:px-40">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="mt-4 space-y-3">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

