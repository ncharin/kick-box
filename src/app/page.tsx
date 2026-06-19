import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/discover')

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
        Le Letterboxd du football
      </h1>
      <p className="text-muted-foreground max-w-md text-base">
        Note les matchs que tu regardes. Écris tes takes. Redécouvre tes plus grands moments de
        foot.
      </p>
      <div className="mt-2 flex gap-3">
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Créer un compte
        </Link>
        <Link
          href="/login"
          className="border-border hover:bg-muted rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </main>
  )
}
