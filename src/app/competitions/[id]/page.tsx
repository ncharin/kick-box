import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCompetition, getCompetitionMatches } from '@/lib/queries'
import { MatchCard } from '@/components/kickbox/MatchCard'
import type { Match } from '@/lib/types'

export const revalidate = 300

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ season?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const competition = await getCompetition(Number(id))
  if (!competition) return { title: 'Compétition — Kickbox' }
  return {
    title: competition.name,
    description: `Tous les matchs de ${competition.name}${competition.country ? ` (${competition.country})` : ''} sur Kickbox`,
  }
}

export default async function CompetitionPage({ params, searchParams }: Props) {
  const { id } = await params
  const { season } = await searchParams

  const competition = await getCompetition(Number(id))
  if (!competition) notFound()

  const matches = (await getCompetitionMatches(Number(id), season)) as unknown as Match[]

  // Saisons disponibles dans les matchs
  const seasons = [...new Set(matches.map((m) => m.season))].sort().reverse()
  const selectedSeason = season ?? seasons[0]

  const filtered = selectedSeason ? matches.filter((m) => m.season === selectedSeason) : matches

  const finished = filtered.filter((m) => m.status === 'finished')
  const upcoming = filtered.filter((m) => m.status === 'scheduled')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{competition.name}</h1>
        {competition.country && (
          <p className="text-muted-foreground text-sm">{competition.country}</p>
        )}
      </div>

      {/* Sélecteur de saison */}
      {seasons.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {seasons.map((s) => (
            <a
              key={s}
              href={`/competitions/${id}?season=${s}`}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                s === selectedSeason
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {s}
            </a>
          ))}
        </div>
      )}

      {/* Matchs à venir */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            À venir
          </h2>
          <div className="flex flex-col gap-2">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Résultats */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
          Résultats
        </h2>
        {finished.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun résultat pour cette saison.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {finished.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
