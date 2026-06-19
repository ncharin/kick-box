export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="bg-muted mb-3 h-5 w-32 animate-pulse rounded" />
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
      </div>
      <div className="border-border mb-6 flex gap-1 border-b">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted mx-1 mb-2 h-4 w-16 animate-pulse rounded" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-border rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
