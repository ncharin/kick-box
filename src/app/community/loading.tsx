export default function CommunityLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <div className="bg-muted h-7 w-40 animate-pulse rounded" />
        <div className="bg-muted mt-2 h-4 w-64 animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="border-border flex items-center gap-3 rounded-lg border px-4 py-3"
          >
            <div className="bg-muted h-4 w-6 animate-pulse rounded" />
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            <div className="flex-1">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-muted mt-1 h-3 w-20 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-4 w-8 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
