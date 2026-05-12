import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncCompetition } from '@/lib/sync'

// Endpoint admin : synchronise une compétition complète
// Utilisation : POST /api/sync/competition/FL1?season=2024-2025
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  // Vérification auth — réservé aux utilisateurs connectés pour l'instant (admin en Phase 5+)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { code } = await params
  const { searchParams } = new URL(request.url)
  const season = searchParams.get('season') ?? getCurrentSeason()

  try {
    const result = await syncCompetition(code.toUpperCase(), season)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getCurrentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  // Saison commence en juillet/août
  return now.getMonth() >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}
