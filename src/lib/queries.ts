// Fonctions de requête Supabase — utilisées dans les Server Components

import { createClient } from '@/lib/supabase/server'

const MATCH_SELECT = `
  id, api_id, competition_id, season, matchday, kickoff, status,
  home_team_id, away_team_id,
  home_score, away_score, home_score_ht, away_score_ht, venue,
  home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url, country),
  away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url, country),
  competition:competitions(id, name, country, logo_url, type)
`

export async function getRecentMatches(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('status', 'finished')
    .order('kickoff', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getUpcomingMatches(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('status', 'scheduled')
    .gte('kickoff', new Date().toISOString())
    .order('kickoff', { ascending: true })
    .limit(limit)
  return data ?? []
}

export async function getMatch(id: number) {
  const supabase = await createClient()
  const { data } = await supabase.from('matches').select(MATCH_SELECT).eq('id', id).single()
  return data
}

export async function getTeam(id: number) {
  const supabase = await createClient()
  const { data } = await supabase.from('teams').select('*').eq('id', id).single()
  return data
}

export async function getTeamMatches(teamId: number, limit = 30) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('kickoff', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getCompetition(id: number) {
  const supabase = await createClient()
  const { data } = await supabase.from('competitions').select('*').eq('id', id).single()
  return data
}

export async function getCompetitionMatches(competitionId: number, season?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('competition_id', competitionId)
    .order('kickoff', { ascending: false })

  if (season) query = query.eq('season', season)

  const { data } = await query.limit(100)
  return data ?? []
}

export async function getCompetitions() {
  const supabase = await createClient()
  const { data } = await supabase.from('competitions').select('*').order('name')
  return data ?? []
}

export async function searchMatches(q: string, limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .or(`home_team.name.ilike.%${q}%,away_team.name.ilike.%${q}%`)
    .order('kickoff', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function searchTeams(q: string, limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('teams')
    .select('*')
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(limit)
  return data ?? []
}

export async function getMatchReviews(matchId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select(`*, profile:profiles(username, display_name, avatar_url)`)
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

// =========================================================
// Requêtes profil utilisateur
// =========================================================

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('username', username).single()
  return data
}

export async function getDiaryEntries(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('diary_entries')
    .select(
      `
      id, watched_on, rating, is_rewatch, created_at,
      match:matches(
        id, kickoff, status, home_score, away_score, season, matchday,
        home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url),
        competition:competitions(id, name)
      ),
      review:reviews(id, content, rating)
    `
    )
    .eq('user_id', userId)
    .order('watched_on', { ascending: false })
  return data ?? []
}

export async function getUserReviews(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select(
      `
      id, content, rating, contains_spoilers, likes_count, created_at,
      match:matches(
        id, kickoff, status, home_score, away_score,
        home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url),
        competition:competitions(id, name)
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getWatchlist(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('watchlist')
    .select(
      `
      added_at,
      match:matches(
        id, kickoff, status, home_score, away_score, season, matchday,
        home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url),
        competition:competitions(id, name)
      )
    `
    )
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
  return data ?? []
}
