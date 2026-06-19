export default function ActivityLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="bg-muted h-7 w-32 animate-pulse rounded" />
        <div className="bg-muted mt-2 h-4 w-56 animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-border bg-card rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-muted h-7 w-7 animate-pulse rounded-full" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-4 w-48 animate-pulse rounded" />
            <div className="bg-muted mt-1 h-3 w-32 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
