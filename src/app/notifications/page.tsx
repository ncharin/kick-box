import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/queries'
import { markNotificationsRead } from '@/app/actions/social'
import { UserAvatar } from '@/components/kickbox/UserAvatar'

type NotifType = 'follow' | 'like' | 'comment'

function notifLabel(type: NotifType): string {
  if (type === 'follow') return 'vous suit maintenant'
  if (type === 'like') return 'a aimé votre review'
  return 'a commenté votre review'
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notifications = await getNotifications(user.id, 50)

  // Marquer toutes comme lues au chargement
  await markNotificationsRead()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">Aucune notification pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((notif) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const actor = notif.actor as any
            const href = notif.match_id
              ? `/matches/${notif.match_id}`
              : actor?.username
                ? `/${actor.username}`
                : '#'

            return (
              <Link
                key={notif.id}
                href={href}
                className={`hover:bg-muted/40 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                  notif.read ? 'border-border' : 'border-primary/30 bg-primary/5'
                }`}
              >
                <UserAvatar
                  url={actor?.avatar_url}
                  name={actor?.display_name ?? actor?.username ?? '?'}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {actor?.display_name ?? actor?.username ?? "Quelqu'un"}
                    </span>{' '}
                    <span className="text-muted-foreground">
                      {notifLabel(notif.type as NotifType)}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(notif.created_at), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notif.read && <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
