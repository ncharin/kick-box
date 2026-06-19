export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="bg-muted mb-6 h-7 w-40 animate-pulse rounded" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {[0, 1].map((col) => (
          <section key={col}>
            <div className="bg-muted mb-3 h-4 w-32 animate-pulse rounded" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-border bg-card rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                      <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                      <div className="bg-muted h-4 w-8 animate-pulse rounded" />
                      <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                    </div>
                    <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
