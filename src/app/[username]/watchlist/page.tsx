import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProfileByUsername, getWatchlist } from '@/lib/queries'
import { MatchCard } from '@/components/kickbox/MatchCard'
import type { Match } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export default async function WatchlistPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const entries = await getWatchlist(profile.id)

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
        <p className="text-muted-foreground mt-1 text-sm">
          {entries.length} match{entries.length > 1 ? 's' : ''} à voir
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Aucun match dans la watchlist. Ajoute des matchs à venir depuis leurs pages.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <MatchCard
              key={(entry.match as unknown as Match).id}
              match={entry.match as unknown as Match}
            />
          ))}
        </div>
      )}
    </div>
  )
}
