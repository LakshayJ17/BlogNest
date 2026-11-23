export const BlogSkeleton = () => (
  <div className="animate-pulse py-8" aria-hidden="true">
    <div className="h-2.5 w-20 rounded-full bg-line" />
    <div className="mt-4 h-6 w-4/5 rounded bg-line" />
    <div className="mt-2 h-6 w-1/2 rounded bg-line" />
    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded-full bg-bone" />
      <div className="h-3 w-11/12 rounded-full bg-bone" />
    </div>
    <div className="mt-6 flex items-center gap-2">
      <div className="h-6 w-6 rounded-full bg-line" />
      <div className="h-3 w-32 rounded-full bg-bone" />
    </div>
  </div>
);

export const BlogListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div role="status" aria-label="Loading stories" className="divide-y divide-line">
    {Array.from({ length: count }, (_, i) => (
      <BlogSkeleton key={i} />
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);
