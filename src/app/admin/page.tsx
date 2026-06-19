'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COMPETITIONS = [
  { code: 'WC', label: 'Coupe du Monde 2026', season: '2026-2027' },
  { code: 'EC', label: 'Euro', season: '2024-2025' },
  { code: 'CL', label: 'Champions League', season: '2024-2025' },
  { code: 'FL1', label: 'Ligue 1', season: '2024-2025' },
  { code: 'PL', label: 'Premier League', season: '2024-2025' },
  { code: 'PD', label: 'La Liga', season: '2024-2025' },
  { code: 'BL1', label: 'Bundesliga', season: '2024-2025' },
  { code: 'SA', label: 'Serie A', season: '2024-2025' },
  { code: 'DED', label: 'Eredivisie (Pays-Bas)', season: '2024-2025' },
  { code: 'PPL', label: 'Primeira Liga (Portugal)', season: '2024-2025' },
  { code: 'ELC', label: 'Championship (Angleterre D2)', season: '2024-2025' },
  { code: 'BSA', label: 'Série A Brésilienne', season: '2024-2025' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function AdminPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [results, setResults] = useState<Record<string, string>>({})
  const [globalStatus, setGlobalStatus] = useState<Status>('idle')

  async function syncOne(code: string, season: string) {
    setStatuses((s) => ({ ...s, [code]: 'loading' }))
    try {
      const res = await fetch(`/api/sync/competition/${code}?season=${season}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setStatuses((s) => ({ ...s, [code]: 'success' }))
        setResults((r) => ({
          ...r,
          [code]: `✓ ${data.matches ?? 0} matchs, ${data.teams ?? 0} équipes`,
        }))
      } else {
        setStatuses((s) => ({ ...s, [code]: 'error' }))
        setResults((r) => ({ ...r, [code]: `✗ ${data.error}` }))
      }
    } catch {
      setStatuses((s) => ({ ...s, [code]: 'error' }))
      setResults((r) => ({ ...r, [code]: '✗ Erreur réseau' }))
    }
  }

  async function syncAll() {
    setGlobalStatus('loading')
    for (const { code, season } of COMPETITIONS) {
      await syncOne(code, season)
    }
    setGlobalStatus('success')
  }

  async function syncRecent() {
    setGlobalStatus('loading')
    try {
      const res = await fetch('/api/cron/sync-recent', {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? 'kickbox_cron_2026'}`,
        },
      })
      const data = await res.json()
      setResults((r) => ({
        ...r,
        recent: res.ok ? `✓ ${data.updated ?? 0} matchs mis à jour` : `✗ ${data.error}`,
      }))
    } catch {
      setResults((r) => ({ ...r, recent: '✗ Erreur réseau' }))
    }
    setGlobalStatus('idle')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Admin — Synchronisation</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={syncAll} disabled={globalStatus === 'loading'}>
            {globalStatus === 'loading' ? 'Sync en cours…' : 'Tout synchroniser'}
          </Button>
          <Button variant="outline" onClick={syncRecent}>
            Mettre à jour les résultats
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compétitions</CardTitle>
          <CardDescription>Synchroniser une compétition depuis football-data.org</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {COMPETITIONS.map(({ code, label, season }) => (
            <div key={code} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                {results[code] && (
                  <p
                    className={`text-xs ${statuses[code] === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    {results[code]}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncOne(code, season)}
                disabled={statuses[code] === 'loading'}
              >
                {statuses[code] === 'loading' ? 'Sync…' : 'Sync'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
