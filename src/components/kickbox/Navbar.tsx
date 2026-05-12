import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-display text-primary text-xl font-bold">
          Kickbox
        </Link>

        {/* Nav principale */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
          >
            Découvrir
          </Link>
          <Link
            href="/search"
            className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
          >
            Recherche
          </Link>
          {user && (
            <Link
              href="/activity"
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              Activité
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user && profile ? (
            <Link
              href={`/${profile.username}`}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              @{profile.username}
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                Connexion
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
