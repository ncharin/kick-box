import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">404</p>
      <h1 className="font-display text-3xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/discover"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  )
}
