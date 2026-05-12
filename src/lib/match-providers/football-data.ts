import { rateLimitedFetch } from './rate-limiter'
import type { MatchDataProvider } from './provider.interface'
import type { NormalizedCompetition, NormalizedMatch, NormalizedTeam } from './types'

const BASE_URL = 'https://api.football-data.org/v4'

// Correspondance code compétition → type
const COMPETITION_TYPES: Record<string, NormalizedCompetition['type']> = {
  PL: 'league',
  BL1: 'league',
  SA: 'league',
  PD: 'league',
  FL1: 'league',
  ELC: 'league',
  DED: 'league',
  PPL: 'league',
  BSA: 'league',
  CL: 'international',
  EC: 'international',
  WC: 'international',
}

const COMPETITION_TIERS: Record<string, number> = {
  PL: 1,
  BL1: 1,
  SA: 1,
  PD: 1,
  FL1: 1,
  DED: 1,
  PPL: 1,
  BSA: 1,
  ELC: 2,
  CL: 1,
  EC: 1,
  WC: 1,
}

function mapStatus(status: string): NormalizedMatch['status'] {
  const map: Record<string, NormalizedMatch['status']> = {
    SCHEDULED: 'scheduled',
    TIMED: 'scheduled',
    IN_PLAY: 'live',
    PAUSED: 'live',
    FINISHED: 'finished',
    POSTPONED: 'postponed',
    SUSPENDED: 'postponed',
    CANCELLED: 'postponed',
  }
  return map[status] ?? 'scheduled'
}

function mapSeason(season: { startDate: string }): string {
  const year = new Date(season.startDate).getFullYear()
  return `${year}-${year + 1}`
}

export class FootballDataProvider implements MatchDataProvider {
  private readonly headers: HeadersInit

  constructor(apiKey: string) {
    this.headers = { 'X-Auth-Token': apiKey }
  }

  private async get<T>(path: string): Promise<T> {
    const res = await rateLimitedFetch(`${BASE_URL}${path}`, {
      headers: this.headers,
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      throw new Error(`football-data.org API error ${res.status} on ${path}`)
    }
    return res.json() as Promise<T>
  }

  async getCompetitions(): Promise<NormalizedCompetition[]> {
    const data = await this.get<{
      competitions: Array<{
        id: number
        name: string
        area: { name: string }
        emblem: string | null
        plan: string
      }>
    }>('/competitions')

    return data.competitions
      .filter((c) => c.plan === 'TIER_ONE')
      .map((c) => ({
        apiId: c.id,
        name: c.name,
        country: c.area?.name ?? null,
        logoUrl: c.emblem ?? null,
        type: 'league' as const,
        tier: 1,
      }))
  }

  async getTeams(competitionCode: string, season: string): Promise<NormalizedTeam[]> {
    const year = season.split('-')[0]
    const data = await this.get<{
      teams: Array<{
        id: number
        name: string
        shortName: string
        area: { name: string }
        crest: string | null
        founded: number | null
      }>
    }>(`/competitions/${competitionCode}/teams?season=${year}`)

    return data.teams.map((t) => ({
      apiId: t.id,
      name: t.name,
      shortName: t.shortName ?? null,
      country: t.area?.name ?? null,
      logoUrl: t.crest ?? null,
      type: 'club' as const,
      founded: t.founded ?? null,
    }))
  }

  async getMatches(competitionCode: string, season: string): Promise<NormalizedMatch[]> {
    const year = season.split('-')[0]
    const data = await this.get<{ matches: RawMatch[] }>(
      `/competitions/${competitionCode}/matches?season=${year}`
    )
    return data.matches.map(mapRawMatch)
  }

  async getMatchesByDateRange(dateFrom: string, dateTo: string): Promise<NormalizedMatch[]> {
    const data = await this.get<{ matches: RawMatch[] }>(
      `/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
    return data.matches.map(mapRawMatch)
  }

  async getMatch(apiId: number): Promise<NormalizedMatch | null> {
    try {
      const data = await this.get<{ match: RawMatch }>(`/matches/${apiId}`)
      return mapRawMatch(data.match)
    } catch {
      return null
    }
  }
}

// Types bruts de l'API
interface RawMatch {
  id: number
  competition: { id: number; code: string }
  season: { startDate: string }
  matchday: number | null
  utcDate: string
  status: string
  homeTeam: { id: number }
  awayTeam: { id: number }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  venue: string | null
  stage: string
  group: string | null
}

function mapRawMatch(m: RawMatch): NormalizedMatch {
  const matchday = m.matchday ? `Journée ${m.matchday}` : (m.group ?? m.stage ?? null)
  return {
    apiId: m.id,
    competitionApiId: m.competition.id,
    season: mapSeason(m.season),
    matchday,
    kickoff: m.utcDate,
    status: mapStatus(m.status),
    homeTeamApiId: m.homeTeam.id,
    awayTeamApiId: m.awayTeam.id,
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    homeScoreHt: m.score.halfTime.home,
    awayScoreHt: m.score.halfTime.away,
    venue: m.venue ?? null,
  }
}
