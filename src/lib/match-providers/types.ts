// Types normalisés — indépendants du provider

export interface NormalizedTeam {
  apiId: number
  name: string
  shortName: string | null
  country: string | null
  logoUrl: string | null
  type: 'club' | 'national'
  founded: number | null
}

export interface NormalizedCompetition {
  apiId: number
  name: string
  country: string | null
  logoUrl: string | null
  type: 'league' | 'cup' | 'international'
  tier: number | null
}

export interface NormalizedMatch {
  apiId: number
  competitionApiId: number
  season: string
  matchday: string | null
  kickoff: string // ISO 8601
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  homeTeamApiId: number
  awayTeamApiId: number
  homeScore: number | null
  awayScore: number | null
  homeScoreHt: number | null
  awayScoreHt: number | null
  venue: string | null
}
