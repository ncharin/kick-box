// Sync des détails d'un match via API-Football + football-data.org → stockage en base
//
// Stratégie :
// - API-Football free : accès dates récentes (±3 jours) sans restriction de saison
// - football-data.org free : referee toujours disponible, goals/cartons null
// - Pour les matchs anciens (> 3 jours) : referee via football-data.org uniquement

import { createServiceClient } from '@/lib/supabase/service'
import { findApiFootballId, fetchFixtureDetails } from '@/lib/api-football'
import type { Match } from '@/lib/types'

const FD_BASE = 'https://api.football-data.org/v4'

async function fetchRefereeFromFD(apiId: number): Promise<string | null> {
  try {
    const res = await fetch(`${FD_BASE}/matches/${apiId}`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    })
    if (!res.ok) return null
    const data = await res.json()
    const m = data.match ?? data
    const ref = (m.referees ?? []).find((r: { type: string }) => r.type === 'REFEREE')
    return ref?.name ?? null
  } catch {
    return null
  }
}

export async function syncMatchDetails(match: Match): Promise<void> {
  const supabase = createServiceClient()

  let fixtureId = match.api_football_id ?? null

  // Essayer l'API-Football seulement si le match est récent (date filter dispo)
  const kickoffDate = new Date(match.kickoff)
  const now = new Date()
  const daysDiff = (now.getTime() - kickoffDate.getTime()) / (1000 * 60 * 60 * 24)
  const isRecent = daysDiff <= 4 // Dans la fenêtre du free tier API-Football

  if (isRecent && process.env.API_FOOTBALL_KEY) {
    if (!fixtureId) {
      fixtureId = await findApiFootballId(
        match.kickoff,
        match.home_team?.name ?? '',
        match.away_team?.name ?? '',
        match.competition?.api_id ?? null,
        match.season
      )
      if (fixtureId) {
        await supabase.from('matches').update({ api_football_id: fixtureId }).eq('id', match.id)
      }
    }

    if (fixtureId) {
      const details = await fetchFixtureDetails(fixtureId)
      await supabase
        .from('matches')
        .update({
          referee: details?.referee ?? null,
          goals: details?.goals ?? [],
          bookings: details?.bookings ?? [],
          substitutions: details?.substitutions ?? [],
          details_fetched_at: new Date().toISOString(),
        })
        .eq('id', match.id)
      return
    }
  }

  // Fallback : referee seulement via football-data.org (toutes saisons, toujours gratuit)
  if (match.api_id && process.env.FOOTBALL_DATA_API_KEY) {
    const referee = await fetchRefereeFromFD(match.api_id)
    await supabase
      .from('matches')
      .update({
        referee,
        details_fetched_at: new Date().toISOString(),
      })
      .eq('id', match.id)
  } else {
    await supabase
      .from('matches')
      .update({ details_fetched_at: new Date().toISOString() })
      .eq('id', match.id)
  }
}
