import { NextResponse } from 'next/server'
import { syncRecentMatches } from '@/lib/sync'

// Cron Vercel : résultats J-1 — appelé à 4h UTC chaque jour
// Protégé par CRON_SECRET
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await syncRecentMatches()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
