// Affichage du score façon scoreboard

interface ScoreDisplayProps {
  homeScore: number | null
  awayScore: number | null
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  kickoff: string
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreDisplay({
  homeScore,
  awayScore,
  status,
  kickoff,
  size = 'md',
}: ScoreDisplayProps) {
  const textSize = { sm: 'text-lg', md: 'text-3xl', lg: 'text-5xl' }[size]
  const kickoffDate = new Date(kickoff)

  if (status === 'finished' && homeScore !== null && awayScore !== null) {
    return (
      <div className={`font-display font-bold tabular-nums ${textSize} flex items-center gap-2`}>
        <span>{homeScore}</span>
        <span className="text-muted-foreground text-[0.6em]">–</span>
        <span>{awayScore}</span>
      </div>
    )
  }

  if (status === 'live') {
    return (
      <div className={`font-display font-bold tabular-nums ${textSize} flex items-center gap-2`}>
        <span>{homeScore ?? 0}</span>
        <span className="text-primary animate-pulse text-[0.6em]">•</span>
        <span>{awayScore ?? 0}</span>
      </div>
    )
  }

  if (status === 'postponed') {
    return <span className="text-muted-foreground text-sm font-medium">Reporté</span>
  }

  // Scheduled — affiche l'heure
  return (
    <div className="flex flex-col items-center">
      <span className="text-muted-foreground text-sm font-medium tabular-nums">
        {kickoffDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
