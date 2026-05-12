// Types applicatifs — alignés sur le schéma Supabase

export interface Team {
  id: number
  api_id: number
  name: string
  short_name: string | null
  country: string | null
  logo_url: string | null
  type: 'club' | 'national'
  founded: number | null
}

export interface Competition {
  id: number
  api_id: number
  name: string
  country: string | null
  logo_url: string | null
  type: 'league' | 'cup' | 'international'
  tier: number | null
}

export interface Match {
  id: number
  api_id: number
  competition_id: number
  season: string
  matchday: string | null
  kickoff: string
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  home_team_id: number | null
  away_team_id: number | null
  home_score: number | null
  away_score: number | null
  home_score_ht: number | null
  away_score_ht: number | null
  venue: string | null
  // Relations jointes
  home_team?: Team | null
  away_team?: Team | null
  competition?: Competition | null
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  matches_logged_count: number
  followers_count: number
  following_count: number
}

export interface Review {
  id: string
  user_id: string
  match_id: number
  content: string
  rating: number | null
  contains_spoilers: boolean
  likes_count: number
  comments_count: number
  created_at: string
  profile?: Profile
  match?: Match
}
