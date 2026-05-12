export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      {/* Badge */}
      <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-1 text-xs font-medium">
        Bientôt disponible
      </span>

      {/* Titre */}
      <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
        Le Letterboxd du football
      </h1>

      {/* Sous-titre */}
      <p className="text-muted-foreground max-w-md text-base">
        Note les matchs que tu regardes. Écris tes takes. Redécouvre tes plus grands moments de
        foot.
      </p>

      {/* CTA placeholder */}
      <div className="mt-2 flex gap-3">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors">
          Rejoindre la liste d&apos;attente
        </button>
      </div>
    </main>
  )
}
