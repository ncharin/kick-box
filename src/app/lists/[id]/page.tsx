import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { MatchCard } from '@/components/kickbox/MatchCard'
import { DeleteListButton } from '@/components/kickbox/DeleteListButton'
import type { Match } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: list } = await supabase
    .from('lists')
    .select(
      'id, name, description, is_public, matches_count, created_at, user_id, profile:profiles(username, display_name)'
    )
    .eq('id', id)
    .single()

  if (!list) notFound()
  if (!list.is_public && user?.id !== list.user_id) notFound()

  const { data: listMatches } = await supabase
    .from('list_matches')
    .select(
      `
      position, added_at, notes,
      match:matches(
        id, kickoff, status, home_score, away_score, season, matchday,
        home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url),
        competition:competitions(id, name)
      )
    `
    )
    .eq('list_id', id)
    .order('position', { ascending: true })
    .order('added_at', { ascending: true })

  const profile = list.profile as unknown as {
    username: string
    display_name: string | null
  } | null
  const isOwner = user?.id === list.user_id

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm">
          {profile && (
            <>
              <Link
                href={`/${profile.username}`}
                className="text-muted-foreground hover:text-foreground"
              >
                @{profile.username}
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link
                href={`/${profile.username}/lists`}
                className="text-muted-foreground hover:text-foreground"
              >
                Listes
              </Link>
              <span className="text-muted-foreground">/</span>
            </>
          )}
          <span className="font-medium">{list.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{list.name}</h1>
            {list.description && (
              <p className="text-muted-foreground mt-1 text-sm">{list.description}</p>
            )}
            <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
              <span>
                {list.matches_count} match{list.matches_count !== 1 ? 's' : ''}
              </span>
              <span>·</span>
              <span>
                Créée le {format(new Date(list.created_at), 'd MMM yyyy', { locale: fr })}
              </span>
              {!list.is_public && <span className="bg-muted rounded px-1.5 py-0.5">Privée</span>}
            </div>
          </div>
          {isOwner && <DeleteListButton listId={id} username={profile?.username ?? ''} />}
        </div>
      </div>

      {/* Matchs */}
      {(listMatches ?? []).length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucun match dans cette liste.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Ajoute des matchs depuis leur page dédiée.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(listMatches ?? []).map((item, idx) => (
            <div
              key={`${item.match && (item.match as unknown as Match).id}-${idx}`}
              className="flex items-start gap-3"
            >
              <span className="text-muted-foreground mt-3 w-5 shrink-0 text-right text-xs">
                {idx + 1}
              </span>
              <div className="flex-1">
                <MatchCard match={item.match as unknown as Match} />
                {item.notes && (
                  <p className="text-muted-foreground mt-1 px-1 text-xs">{item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
