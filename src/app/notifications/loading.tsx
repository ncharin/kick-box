export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="bg-muted mb-6 h-7 w-40 animate-pulse rounded" />
      <div className="flex flex-col gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-border flex items-center gap-3 rounded-lg border px-4 py-3"
          >
            <div className="bg-muted h-9 w-9 animate-pulse rounded-full" />
            <div className="flex-1">
              <div className="bg-muted h-4 w-56 animate-pulse rounded" />
              <div className="bg-muted mt-1 h-3 w-24 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
