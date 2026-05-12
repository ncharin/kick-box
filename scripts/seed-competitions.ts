/**
 * Script de seed : synchronise les compétitions listées depuis football-data.org → Supabase
 * Usage : npx tsx scripts/seed-competitions.ts FL1 PL
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charge .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { FootballDataProvider } from '../src/lib/match-providers/football-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const provider = new FootballDataProvider(process.env.FOOTBALL_DATA_API_KEY!)

function getCurrentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  return now.getMonth() >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function seedCompetition(code: string, season: string) {
  console.log(`\n▶ Sync ${code} saison ${season}`)

  // 1. Équipes
  console.log('  → Récupération des équipes...')
  const teams = await provider.getTeams(code, season)
  console.log(`  → ${teams.length} équipes récupérées`)

  const teamRows = teams.map((t) => ({
    api_id: t.apiId,
    name: t.name,
    short_name: t.shortName,
    country: t.country,
    logo_url: t.logoUrl,
    type: t.type,
    founded: t.founded,
  }))
  const { error: teamsError } = await supabase
    .from('teams')
    .upsert(teamRows, { onConflict: 'api_id' })
  if (teamsError) throw new Error(`Erreur upsert teams : ${teamsError.message}`)
  console.log(`  ✓ ${teams.length} équipes upsertées`)

  await sleep(6500) // rate limiter

  // 2. Compétitions
  console.log('  → Récupération des compétitions...')
  const competitions = await provider.getCompetitions()
  const compRows = competitions.map((c) => ({
    api_id: c.apiId,
    name: c.name,
    country: c.country,
    logo_url: c.logoUrl,
    type: c.type,
    tier: c.tier,
  }))
  await supabase.from('competitions').upsert(compRows, { onConflict: 'api_id' })
  console.log(`  ✓ ${competitions.length} compétitions upsertées`)

  await sleep(6500)

  // 3. Matchs
  console.log('  → Récupération des matchs...')
  const matches = await provider.getMatches(code, season)
  console.log(`  → ${matches.length} matchs récupérés`)

  if (matches.length === 0) {
    console.log('  ⚠ Aucun match trouvé')
    return
  }

  const compApiId = matches[0].competitionApiId
  const { data: compRow } = await supabase
    .from('competitions')
    .select('id')
    .eq('api_id', compApiId)
    .single()

  if (!compRow) throw new Error(`Compétition api_id=${compApiId} introuvable en base`)

  // Mapping team api_id → id
  const teamApiIds = [...new Set(matches.flatMap((m) => [m.homeTeamApiId, m.awayTeamApiId]))]
  const { data: teamRows2 } = await supabase
    .from('teams')
    .select('id, api_id')
    .in('api_id', teamApiIds)
  const teamMap = new Map(
    (teamRows2 ?? []).map((t: { api_id: number; id: number }) => [t.api_id, t.id])
  )

  const matchRows = matches.map((m) => ({
    api_id: m.apiId,
    competition_id: compRow.id,
    season: m.season,
    matchday: m.matchday,
    kickoff: m.kickoff,
    status: m.status,
    home_team_id: teamMap.get(m.homeTeamApiId) ?? null,
    away_team_id: teamMap.get(m.awayTeamApiId) ?? null,
    home_score: m.homeScore,
    away_score: m.awayScore,
    home_score_ht: m.homeScoreHt,
    away_score_ht: m.awayScoreHt,
    venue: m.venue,
    updated_at: new Date().toISOString(),
  }))

  // Upsert par batch de 50 pour éviter les timeouts
  for (let i = 0; i < matchRows.length; i += 50) {
    const batch = matchRows.slice(i, i + 50)
    const { error: matchError } = await supabase
      .from('matches')
      .upsert(batch, { onConflict: 'api_id' })
    if (matchError) throw new Error(`Erreur upsert matches batch ${i} : ${matchError.message}`)
    process.stdout.write('.')
  }

  console.log(`\n  ✓ ${matches.length} matchs upsertés`)

  // Log
  await supabase.from('api_sync_logs').insert({
    endpoint: `/competitions/${code}/matches`,
    status: 200,
    items_synced: teams.length + matches.length,
  })
}

async function main() {
  const codes = process.argv.slice(2)
  if (codes.length === 0) {
    console.log('Usage : npx tsx scripts/seed-competitions.ts FL1 PL [...]')
    process.exit(1)
  }

  const season = getCurrentSeason()
  console.log(`Saison courante : ${season}`)
  console.log(`Compétitions à synchroniser : ${codes.join(', ')}`)

  for (const code of codes) {
    await seedCompetition(code.toUpperCase(), season)
    if (codes.indexOf(code) < codes.length - 1) {
      console.log('\n  ⏳ Pause rate-limiter (6.5s)...')
      await sleep(6500)
    }
  }

  console.log('\n✅ Seed terminé !')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Erreur :', err.message)
  process.exit(1)
})
