import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProfileByUsername, getWatchlist } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'
import { MatchCard } from '@/components/kickbox/MatchCard'
import { ProfileNav } from '@/components/kickbox/ProfileNav'
import { toggleWatchlist } from '@/app/actions/log'
import type { Match } from '@/lib/types'

const PAGE_SIZE = 30

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function WatchlistPage({ params, searchParams }: Props) {
  const { username } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  const entries = await getWatchlist(profile.id, { limit: PAGE_SIZE, offset })
  const hasNext = entries.length === PAGE_SIZE
  const hasPrev = page > 1

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href={`/${username}`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            @{username}
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm font-medium">Watchlist</span>
        </div>
        <h1 className="font-display text-2xl font-bold">
          Watchlist de {profile.display_name ?? username}
        </h1>
      </div>

      <ProfileNav username={username} active="watchlist" />

      {entries.length === 0 && page === 1 ? (
        <div className="border-border rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Aucun match dans la watchlist. Ajoute des matchs à venir depuis leurs pages.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const match = entry.match as unknown as Match
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const removeAction = toggleWatchlist.bind(null, match.id, true) as any
              return (
                <div key={match.id} className="group relative">
                  <MatchCard match={match} />
                  {isOwnProfile && (
                    <form
                      action={removeAction}
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                    >
                      <button
                        type="submit"
                        className="text-muted-foreground hover:text-destructive rounded px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                        title="Retirer de la watchlist"
                      >
                        Retirer
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>

          {(hasPrev || hasNext) && (
            <div className="mt-8 flex items-center justify-between">
              {hasPrev ? (
                <Link
                  href={`/${username}/watchlist?page=${page - 1}`}
                  className="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm transition-colors"
                >
                  ← Page précédente
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground text-sm">Page {page}</span>
              {hasNext ? (
                <Link
                  href={`/${username}/watchlist?page=${page + 1}`}
                  className="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm transition-colors"
                >
                  Page suivante →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
