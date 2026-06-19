import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProfileByUsername } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'
import { CreateListButton } from '@/components/kickbox/CreateListButton'
import { ProfileNav } from '@/components/kickbox/ProfileNav'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ListsPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  const { data: lists } = await supabase
    .from('lists')
    .select('id, name, description, is_public, matches_count, created_at')
    .eq('user_id', profile.id)
    .order('updated_at', { ascending: false })

  const visibleLists = (lists ?? []).filter((l) => l.is_public || isOwnProfile)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href={`/${username}`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            @{username}
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm font-medium">Listes</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">
            Listes de {profile.display_name ?? username}
          </h1>
          {isOwnProfile && <CreateListButton />}
        </div>
      </div>

      <ProfileNav username={username} active="listes" />

      {visibleLists.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucune liste pour l&apos;instant.</p>
          {isOwnProfile && (
            <p className="text-muted-foreground mt-1 text-xs">
              Crée une liste pour regrouper tes matchs favoris.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleLists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="border-border hover:bg-muted/50 rounded-lg border p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{list.name}</span>
                    {!list.is_public && (
                      <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]">
                        Privée
                      </span>
                    )}
                  </div>
                  {list.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {list.description}
                    </p>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 text-sm">
                  {list.matches_count} match{list.matches_count !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
