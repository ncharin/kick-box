import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MatchCard } from '@/components/kickbox/MatchCard'
import { TeamBadge } from '@/components/kickbox/TeamBadge'
import { Input } from '@/components/ui/input'
import type { Match, Team } from '@/lib/types'

const MATCH_SELECT = `
  id, api_id, season, matchday, kickoff, status,
  home_score, away_score, home_score_ht, away_score_ht, venue,
  home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url, country),
  away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url, country),
  competition:competitions(id, name, country, logo_url, type)
`

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  let matches: Match[] = []
  let teams: Team[] = []

  if (query.length >= 2) {
    const supabase = await createClient()

    const [matchesRes, teamsRes] = await Promise.all([
      supabase
        .from('matches')
        .select(MATCH_SELECT)
        .or(`home_team.name.ilike.%${query}%,away_team.name.ilike.%${query}%`)
        .order('kickoff', { ascending: false })
        .limit(20),
      supabase.from('teams').select('*').ilike('name', `%${query}%`).order('name').limit(10),
    ])

    matches = (matchesRes.data ?? []) as unknown as Match[]
    teams = (teamsRes.data ?? []) as Team[]
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Recherche</h1>

      {/* Champ de recherche */}
      <form method="GET" className="mb-8">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Rechercher un match, une équipe…"
          className="text-base"
          autoFocus
        />
      </form>

      {query.length >= 2 ? (
        <>
          {/* Équipes */}
          {teams.length > 0 && (
            <section className="mb-8">
              <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                Équipes
              </h2>
              <div className="flex flex-col gap-1">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="border-border bg-card hover:border-primary/40 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
                  >
                    <TeamBadge
                      name={team.name}
                      logoUrl={team.logo_url}
                      size="sm"
                      showName={false}
                    />
                    <div>
                      <p className="text-sm font-medium">{team.name}</p>
                      {team.country && (
                        <p className="text-muted-foreground text-xs">{team.country}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Matchs */}
          {matches.length > 0 && (
            <section>
              <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
                Matchs
              </h2>
              <div className="flex flex-col gap-2">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {teams.length === 0 && matches.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Aucun résultat pour &quot;{query}&quot;.
            </p>
          )}
        </>
      ) : query.length > 0 ? (
        <p className="text-muted-foreground text-sm">Tape au moins 2 caractères.</p>
      ) : null}
    </div>
  )
}
