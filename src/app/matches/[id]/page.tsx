import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MapPin, Calendar } from 'lucide-react'
import { getMatch } from '@/lib/queries'
import { TeamBadge } from '@/components/kickbox/TeamBadge'
import { ScoreDisplay } from '@/components/kickbox/ScoreDisplay'
import { Badge } from '@/components/ui/badge'
import type { Match } from '@/lib/types'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: Props) {
  const { id } = await params
  const match = (await getMatch(Number(id))) as Match | null

  if (!match) notFound()

  const kickoff = new Date(match.kickoff)
  const homeTeam = match.home_team
  const awayTeam = match.away_team
  const competition = match.competition

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Compétition */}
      <div className="mb-6 flex items-center gap-2">
        <Badge variant="secondary">{competition?.name ?? '—'}</Badge>
        {match.matchday && <span className="text-muted-foreground text-sm">{match.matchday}</span>}
        {match.season && <span className="text-muted-foreground text-sm">· {match.season}</span>}
      </div>

      {/* Score central */}
      <div className="border-border bg-card mb-6 rounded-xl border p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Équipe domicile */}
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge
              name={homeTeam?.name ?? '?'}
              logoUrl={homeTeam?.logo_url}
              size="lg"
              align="center"
              showName={false}
            />
            <span className="text-sm leading-tight font-semibold">{homeTeam?.name ?? '?'}</span>
            <span className="text-muted-foreground text-xs">Domicile</span>
          </div>

          {/* Score */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <ScoreDisplay
              homeScore={match.home_score}
              awayScore={match.away_score}
              status={match.status}
              kickoff={match.kickoff}
              size="lg"
            />
            {match.status === 'finished' &&
              match.home_score_ht !== null &&
              match.away_score_ht !== null && (
                <span className="text-muted-foreground text-xs">
                  ({match.home_score_ht} – {match.away_score_ht}) mi-temps
                </span>
              )}
            {match.status === 'live' && (
              <Badge className="bg-primary text-primary-foreground text-[10px]">EN DIRECT</Badge>
            )}
          </div>

          {/* Équipe extérieur */}
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge
              name={awayTeam?.name ?? '?'}
              logoUrl={awayTeam?.logo_url}
              size="lg"
              align="center"
              showName={false}
            />
            <span className="text-sm leading-tight font-semibold">{awayTeam?.name ?? '?'}</span>
            <span className="text-muted-foreground text-xs">Extérieur</span>
          </div>
        </div>
      </div>

      {/* Infos du match */}
      <div className="text-muted-foreground mb-8 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{format(kickoff, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}</span>
        </div>
        {match.venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{match.venue}</span>
          </div>
        )}
      </div>

      {/* Section reviews — placeholder Phase 3 */}
      <section>
        <h2 className="font-display mb-4 text-lg font-bold">Reviews de la communauté</h2>
        <div className="border-border rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">Les reviews arrivent en Phase 3.</p>
        </div>
      </section>
    </div>
  )
}
