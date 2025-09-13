export default function PostDetailSkeleton() {
  return (
    <article className="w-full p-8 lg:px-40 bg-white">
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        ))}
      </div>
    </article>
  );
}

