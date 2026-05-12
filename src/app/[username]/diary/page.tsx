import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getProfileByUsername, getDiaryEntries } from '@/lib/queries'
import { MatchCard } from '@/components/kickbox/MatchCard'
import { RatingStars } from '@/components/kickbox/RatingStars'
import type { Match } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export default async function DiaryPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const entries = await getDiaryEntries(profile.id)

  // Grouper par mois
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const key = format(new Date(entry.watched_on), 'MMMM yyyy', { locale: fr })
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header profil */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href={`/${username}`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            @{username}
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm font-medium">Journal</span>
        </div>
        <h1 className="font-display text-2xl font-bold">
          Journal de {profile.display_name ?? username}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {profile.matches_logged_count} matchs vus
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucun match loggé pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([month, monthEntries]) => (
            <section key={month}>
              <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider capitalize uppercase">
                {month}
              </h2>
              <div className="flex flex-col gap-2">
                {monthEntries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-1">
                    <MatchCard match={entry.match as unknown as Match} />
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-muted-foreground text-xs">
                        Vu le {format(new Date(entry.watched_on), 'd MMM', { locale: fr })}
                        {entry.is_rewatch ? ' · revisionnage' : ''}
                      </span>
                      {entry.rating && <RatingStars value={entry.rating} readOnly size="sm" />}
                      {entry.review && (
                        <Link
                          href={`/matches/${(entry.match as unknown as Match).id}`}
                          className="text-primary text-xs hover:underline"
                        >
                          Voir ma review →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
