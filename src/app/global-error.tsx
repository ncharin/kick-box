'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr" className="dark h-full antialiased">
      <body className="bg-background text-foreground flex min-h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Erreur critique</h1>
        <p className="text-muted-foreground text-sm">
          L&apos;application a rencontré une erreur inattendue.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Réessayer
        </button>
      </body>
    </html>
  )
}
