import Link from 'next/link'
import Image from 'next/image'
import { getCompetitions } from '@/lib/queries'

export const revalidate = 3600

const COMPETITION_TYPE_LABEL: Record<string, string> = {
  league: 'Ligues',
  cup: 'Coupes',
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()

  // Grouper par type puis par pays
  const byType = competitions.reduce<Record<string, typeof competitions>>((acc, c) => {
    const type = c.type ?? 'league'
    if (!acc[type]) acc[type] = []
    acc[type].push(c)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Compétitions</h1>

      {Object.entries(byType).map(([type, comps]) => (
        <section key={type} className="mb-8">
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
            {COMPETITION_TYPE_LABEL[type] ?? type}
          </h2>
          <div className="flex flex-col gap-2">
            {comps.map((competition) => (
              <Link
                key={competition.id}
                href={`/competitions/${competition.id}`}
                className="border-border hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
              >
                {competition.logo_url ? (
                  <Image
                    src={competition.logo_url}
                    alt={competition.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded text-xs font-bold">
                    {competition.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{competition.name}</p>
                  {competition.country && (
                    <p className="text-muted-foreground text-xs">{competition.country}</p>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
