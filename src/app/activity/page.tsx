import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getActivityFeedPaginated } from '@/lib/queries'
import { RatingStars } from '@/components/kickbox/RatingStars'
import { UserAvatar } from '@/components/kickbox/UserAvatar'
import type { Match } from '@/lib/types'

type FeedProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function ActivityPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const { reviews, diary, hasMore } = await getActivityFeedPaginated(user.id, page, 20)

  // Fusionner et trier par date décroissante
  const feed = [
    ...reviews.map((r) => ({ ...r, _type: 'review' as const, _date: r.created_at })),
    ...diary.map((d) => ({ ...d, _type: 'diary' as const, _date: d.created_at })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime())

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Activité</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ce que font les personnes que vous suivez
        </p>
      </div>

      {feed.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">Aucune activité pour l&apos;instant.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Suivez des utilisateurs pour voir leur activité ici.
          </p>
          <Link
            href="/community"
            className="text-primary mt-3 inline-block text-sm hover:underline"
          >
            Découvrir des membres →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((item) => {
            const match = item.match as unknown as Match
            const profile = item.profile as unknown as FeedProfile | null
            const homeTeam = match?.home_team
            const awayTeam = match?.away_team
            const matchLabel =
              homeTeam && awayTeam
                ? `${homeTeam.short_name ?? homeTeam.name} vs ${awayTeam.short_name ?? awayTeam.name}`
                : 'Match inconnu'

            if (item._type === 'diary') {
              // Carte log de match
              return (
                <div
                  key={`diary-${item.id}`}
                  className="border-border bg-card rounded-xl border p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    {profile?.avatar_url ? (
                      <UserAvatar url={profile.avatar_url} name={'?'} size={28} />
                    ) : (
                      <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                        {(profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()}
                      </div>
                    )}
                    <Link
                      href={`/${profile?.username}`}
                      className="hover:text-primary text-sm font-medium hover:underline"
                    >
                      {profile?.display_name ?? profile?.username}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      a regardé ·{' '}
                      {formatDistanceToNow(new Date(item._date), { locale: fr, addSuffix: true })}
                    </span>
                  </div>
                  <Link href={`/matches/${match?.id}`} className="hover:text-primary block">
                    <p className="text-sm font-medium">{matchLabel}</p>
                    {match?.competition && (
                      <p className="text-muted-foreground text-xs">
                        {(match.competition as { name: string }).name}
                      </p>
                    )}
                  </Link>
                  <div className="mt-2 flex items-center gap-3">
                    {(item as { rating?: number | null }).rating && (
                      <RatingStars value={(item as { rating: number }).rating} readOnly size="sm" />
                    )}
                    {(item as { is_rewatch?: boolean }).is_rewatch && (
                      <span className="text-muted-foreground text-xs">Revisionnage</span>
                    )}
                    {(item as { watched_on?: string }).watched_on && (
                      <span className="text-muted-foreground text-xs">
                        {format(new Date((item as { watched_on: string }).watched_on), 'd MMM', {
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )
            }

            // Carte review
            const review = item as (typeof reviews)[number] & { _type: 'review'; _date: string }
            return (
              <div
                key={`review-${review.id}`}
                className="border-border bg-card rounded-xl border p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  {profile?.avatar_url ? (
                    <UserAvatar url={profile.avatar_url} name={'?'} size={28} />
                  ) : (
                    <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                      {(profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                  <Link
                    href={`/${profile?.username}`}
                    className="hover:text-primary text-sm font-medium hover:underline"
                  >
                    {profile?.display_name ?? profile?.username}
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    a reviewé ·{' '}
                    {formatDistanceToNow(new Date(review._date), { locale: fr, addSuffix: true })}
                  </span>
                </div>

                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/matches/${match?.id}`}
                      className="hover:text-primary text-sm font-medium hover:underline"
                    >
                      {matchLabel}
                    </Link>
                    {match?.competition && (
                      <p className="text-muted-foreground text-xs">
                        {(match.competition as { name: string }).name}
                      </p>
                    )}
                  </div>
                  {review.rating && <RatingStars value={review.rating} readOnly size="sm" />}
                </div>

                {review.contains_spoilers ? (
                  <details>
                    <summary className="text-muted-foreground cursor-pointer text-xs">
                      Contient des spoilers — cliquer pour afficher
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed">{review.content}</p>
                  </details>
                ) : (
                  <p className="line-clamp-4 text-sm leading-relaxed">{review.content}</p>
                )}

                {(review.likes_count > 0 || review.comments_count > 0) && (
                  <div className="border-border mt-3 flex items-center gap-3 border-t pt-3">
                    {review.likes_count > 0 && (
                      <span className="text-muted-foreground text-xs">❤️ {review.likes_count}</span>
                    )}
                    {review.comments_count > 0 && (
                      <Link
                        href={`/matches/${match?.id}`}
                        className="text-muted-foreground hover:text-foreground text-xs"
                      >
                        💬 {review.comments_count} commentaire
                        {review.comments_count !== 1 ? 's' : ''}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <Link
              href={`/activity?page=${page - 1}`}
              className="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm transition-colors"
            >
              ← Plus récent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground text-sm">Page {page}</span>
          {hasMore ? (
            <Link
              href={`/activity?page=${page + 1}`}
              className="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm transition-colors"
            >
              Plus ancien →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}
