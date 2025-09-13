import ProfileSkeleton from "@/components/Skeletons/ProfileSkeleton";
import PostCardSkeleton from "@/components/Skeletons/PostCardSkeleton";

export default function Loading() {
  return (
    <div className="w-full p-6 lg:px-40">
      <ProfileSkeleton />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

