export default function MatchLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="border-border bg-card mb-6 rounded-xl border p-6">
        <div className="bg-muted mx-auto mb-4 h-4 w-32 animate-pulse rounded" />
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-10 w-24 animate-pulse rounded" />
          <div className="flex flex-col items-center gap-2">
            <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-4">
            <div className="bg-muted mb-3 h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-16 w-full animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
