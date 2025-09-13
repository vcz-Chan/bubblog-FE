export default function Loading() {
  return (
    <div className="w-full p-6 lg:px-40">
      <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-12 bg-gray-200 rounded animate-pulse ${i % 2 ? 'ml-12' : 'mr-12'}`} />
        ))}
      </div>
    </div>
  );
}

