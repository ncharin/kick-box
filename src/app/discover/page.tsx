import { getRecentMatches, getUpcomingMatches } from '@/lib/queries'
import { MatchCard } from '@/components/kickbox/MatchCard'
import type { Match } from '@/lib/types'

export const revalidate = 300 // 5 min

export default async function DiscoverPage() {
  const [recent, upcoming] = await Promise.all([getRecentMatches(20), getUpcomingMatches(20)])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Découvrir</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Matchs récents */}
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            Résultats récents
          </h2>
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun match récent.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {(recent as unknown as Match[]).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        {/* Matchs à venir */}
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            À venir
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun match à venir.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {(upcoming as unknown as Match[]).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
