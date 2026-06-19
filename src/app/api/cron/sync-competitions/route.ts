import { NextResponse } from 'next/server'
import { syncCompetition } from '@/lib/sync'

// Cron hebdomadaire : synchronise les compétitions importantes
// Appelé chaque lundi à 5h UTC
const COMPETITIONS = [
  { code: 'WC', season: '2026-2027' }, // Coupe du Monde 2026
  { code: 'EC', season: '2024-2025' }, // Euro
  { code: 'CL', season: '2024-2025' }, // Champions League
  { code: 'FL1', season: '2024-2025' }, // Ligue 1
  { code: 'PL', season: '2024-2025' }, // Premier League
  { code: 'PD', season: '2024-2025' }, // La Liga
  { code: 'BL1', season: '2024-2025' }, // Bundesliga
  { code: 'SA', season: '2024-2025' }, // Serie A
  { code: 'DED', season: '2024-2025' }, // Eredivisie (Pays-Bas)
  { code: 'PPL', season: '2024-2025' }, // Primeira Liga (Portugal)
  { code: 'ELC', season: '2024-2025' }, // Championship (Angleterre D2)
  { code: 'BSA', season: '2024-2025' }, // Série A Brésilienne
]

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  for (const { code, season } of COMPETITIONS) {
    try {
      const result = await syncCompetition(code, season)
      results[code] = result
    } catch (err) {
      results[code] = { error: err instanceof Error ? err.message : String(err) }
    }
  }

  return NextResponse.json({ success: true, results })
}
