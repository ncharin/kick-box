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
  homeTeamData?: {
    name: string
    shortName: string | null
    logoUrl: string | null
    country: string | null
  }
  awayTeamData?: {
    name: string
    shortName: string | null
    logoUrl: string | null
    country: string | null
  }
  homeScore: number | null
  awayScore: number | null
  homeScoreHt: number | null
  awayScoreHt: number | null
  venue: string | null
  // Détails optionnels (récupérés à la demande)
  referee?: string | null
  goals?: MatchGoal[]
  bookings?: MatchBooking[]
  substitutions?: MatchSubstitution[]
}

export interface MatchGoal {
  minute: number
  injuryTime: number | null
  type: 'REGULAR' | 'OWN_GOAL' | 'PENALTY'
  isHome: boolean
  scorer: string
  assist: string | null
}

export interface MatchBooking {
  minute: number
  isHome: boolean
  player: string
  card: 'YELLOW_CARD' | 'YELLOW_RED_CARD' | 'RED_CARD'
}

export interface MatchSubstitution {
  minute: number
  isHome: boolean
  playerOut: string
  playerIn: string
}
