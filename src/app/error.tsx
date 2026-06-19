'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Ici on pourrait envoyer l'erreur à Sentry
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">500</p>
      <h1 className="font-display text-3xl font-bold">Quelque chose s&apos;est mal passé</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Une erreur inattendue s&apos;est produite. L&apos;équipe a été notifiée.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/discover"
          className="border-border hover:bg-muted rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
