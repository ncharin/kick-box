// Client API-Football (api-football.com) — utilisé pour les détails de match
// Free tier : 100 req/jour, seasons 2022-2024
// Doc : https://www.api-football.com/documentation-v3

import type { MatchGoal, MatchBooking, MatchSubstitution } from './types'

const BASE_URL = 'https://v3.football.api-sports.io'

function headers() {
  return { 'x-apisports-key': process.env.API_FOOTBALL_KEY! }
}

// Correspondance football-data.org competition apiId → API-Football league ID
const LEAGUE_ID_MAP: Record<number, number> = {
  2021: 39, // Premier League
  2015: 61, // Ligue 1
  2019: 135, // Serie A
  2002: 78, // Bundesliga
  2014: 140, // La Liga
  2016: 40, // Championship
  2003: 88, // Eredivisie
  2017: 94, // Primeira Liga
  2001: 2, // UEFA Champions League
  2018: 4, // UEFA Euro
  2000: 1, // FIFA World Cup
}

interface ApiFixture {
  fixture: {
    id: number
    referee: string | null
    date: string
    venue: { name: string | null; city: string | null }
    status: { short: string }
  }
  teams: {
    home: { id: number; name: string }
    away: { id: number; name: string }
  }
  goals: { home: number | null; away: number | null }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
  }
  events?: ApiEvent[]
}

interface ApiEvent {
  time: { elapsed: number; extra: number | null }
  team: { id: number; name: string }
  player: { id: number | null; name: string | null }
  assist: { id: number | null; name: string | null } | null
  type: 'Goal' | 'Card' | 'subst' | 'Var'
  detail: string
  comments: string | null
}

// Normalise un nom d'équipe pour la comparaison (retire FC, SC, AFC, etc.)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /\b(fc|sc|afc|cf|ac|as|ss|bv|vv|bsc|rb|rcd|sd|ud|rc|ca|cd|ssc|fsv|vfb|vfl|tsv|1\.)\b/g,
      ''
    )
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function namesSimilar(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (na === nb) return true
  const wordsA = na.split(' ').filter((w) => w.length > 2)
  const wordsB = nb.split(' ').filter((w) => w.length > 2)
  return wordsA.some((w) => wordsB.includes(w))
}

// Trouve l'ID fixture API-Football pour un match donné
// competitionApiId = api_id de la compétition (football-data.org numeric ID)
// season = "2024-2025" → on extrait "2024"
// Note : le plan gratuit ne permet pas le filtre ?date= sur les saisons passées.
// On récupère tous les fixtures de la saison (1 appel) et on filtre côté client.
export async function findApiFootballId(
  kickoff: string,
  homeTeamName: string,
  awayTeamName: string,
  competitionApiId: number | null,
  season: string
): Promise<number | null> {
  const matchDate = kickoff.slice(0, 10) // "YYYY-MM-DD"

  // Stratégie 1 : chercher par date (free tier = dates récentes uniquement)
  const resDate = await fetch(`${BASE_URL}/fixtures?date=${matchDate}`, {
    headers: headers(),
  })
  if (resDate.ok) {
    const dataDate = await resDate.json()
    if (!dataDate.errors || Object.keys(dataDate.errors).length === 0) {
      const fixtures: ApiFixture[] = dataDate.response ?? []
      const found = fixtures.find(
        (f) =>
          namesSimilar(f.teams.home.name, homeTeamName) &&
          namesSimilar(f.teams.away.name, awayTeamName)
      )
      if (found) return found.fixture.id
    }
  }

  // Stratégie 2 : chercher par league + season (accès historique, free = 2022-2024)
  const leagueId = competitionApiId ? LEAGUE_ID_MAP[competitionApiId] : null
  if (!leagueId) return null

  const seasonYear = season.split('-')[0] // "2024-2025" → "2024"

  const res = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&season=${seasonYear}`, {
    headers: headers(),
  })
  if (!res.ok) return null

  const data = await res.json()
  if (data.errors && Object.keys(data.errors).length > 0) return null

  const fixtures: ApiFixture[] = data.response ?? []

  const match = fixtures.find(
    (f) =>
      f.fixture.date.slice(0, 10) === matchDate &&
      namesSimilar(f.teams.home.name, homeTeamName) &&
      namesSimilar(f.teams.away.name, awayTeamName)
  )

  return match?.fixture.id ?? null
}

// Récupère les détails complets d'un fixture (events inclus)
export async function fetchFixtureDetails(fixtureId: number): Promise<{
  referee: string | null
  goals: MatchGoal[]
  bookings: MatchBooking[]
  substitutions: MatchSubstitution[]
} | null> {
  const res = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, { headers: headers() })
  if (!res.ok) return null

  const data = await res.json()
  const fixture: ApiFixture = data.response?.[0]
  if (!fixture) return null

  const events = fixture.events ?? []
  const homeTeamId = fixture.teams.home.id
  const awayTeamId = fixture.teams.away.id

  const goals: MatchGoal[] = events
    .filter((e) => e.type === 'Goal' && e.detail !== 'Missed Penalty')
    .map((e) => ({
      minute: e.time.elapsed,
      injuryTime: e.time.extra ?? null,
      type: e.detail === 'Own Goal' ? 'OWN_GOAL' : e.detail === 'Penalty' ? 'PENALTY' : 'REGULAR',
      isHome: e.team.id === homeTeamId,
      scorer: e.player.name ?? 'Inconnu',
      assist: e.assist?.name ?? null,
    }))

  const bookings: MatchBooking[] = events
    .filter((e) => e.type === 'Card')
    .map((e) => ({
      minute: e.time.elapsed,
      isHome: e.team.id === homeTeamId,
      player: e.player.name ?? 'Inconnu',
      card:
        e.detail === 'Red Card'
          ? 'RED_CARD'
          : e.detail === 'Yellow Red Card'
            ? 'YELLOW_RED_CARD'
            : 'YELLOW_CARD',
    }))

  const substitutions: MatchSubstitution[] = events
    .filter((e) => e.type === 'subst')
    .map((e) => ({
      minute: e.time.elapsed,
      isHome: e.team.id === homeTeamId || e.team.id !== awayTeamId,
      playerOut: e.player.name ?? 'Inconnu',
      playerIn: e.assist?.name ?? 'Inconnu',
    }))

  return {
    referee: fixture.fixture.referee,
    goals,
    bookings,
    substitutions,
  }
}
