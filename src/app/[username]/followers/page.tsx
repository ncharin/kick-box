import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getFollowers } from '@/lib/queries'
import { ProfileNav } from '@/components/kickbox/ProfileNav'
import { FollowButton } from '@/components/kickbox/FollowButton'
import { UserAvatar } from '@/components/kickbox/UserAvatar'

interface Props {
  params: Promise<{ username: string }>
}

export default async function FollowersPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const followers = await getFollowers(profile.id)

  // Batch : une seule requête pour savoir qui je suis parmi ces followers
  const myFollowingSet = new Set<string>()
  if (user && followers.length > 0) {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in(
        'following_id',
        followers.map((f) => f.id)
      )
    ;(data ?? []).forEach((r) => myFollowingSet.add(r.following_id))
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold">
          {profile.display_name ?? profile.username}
        </h1>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
      </div>

      <ProfileNav username={username} active="profil" />

      <div className="mb-4">
        <h2 className="text-sm font-semibold">
          Abonnés <span className="text-muted-foreground font-normal">({followers.length})</span>
        </h2>
      </div>

      {followers.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucun abonné pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {followers.map((follower) => {
            if (!follower) return null
            const isMe = user?.id === follower.id
            return (
              <div
                key={follower.id}
                className="border-border flex items-center gap-3 rounded-lg border p-3"
              >
                <UserAvatar
                  url={follower.avatar_url}
                  name={follower.display_name ?? follower.username}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/${follower.username}`} className="hover:underline">
                    <p className="text-sm font-medium">
                      {follower.display_name ?? follower.username}
                    </p>
                    <p className="text-muted-foreground text-xs">@{follower.username}</p>
                  </Link>
                </div>
                {user && !isMe && (
                  <FollowButton
                    targetUserId={follower.id}
                    initialIsFollowing={myFollowingSet.has(follower.id)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
