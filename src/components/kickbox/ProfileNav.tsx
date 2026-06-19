import Link from 'next/link'

interface ProfileNavProps {
  username: string
  active: 'profil' | 'journal' | 'reviews' | 'watchlist' | 'stats' | 'listes'
}

const tabs = [
  { key: 'profil', label: 'Profil', href: (u: string) => `/${u}` },
  { key: 'journal', label: 'Journal', href: (u: string) => `/${u}/diary` },
  { key: 'reviews', label: 'Reviews', href: (u: string) => `/${u}/reviews` },
  { key: 'watchlist', label: 'Watchlist', href: (u: string) => `/${u}/watchlist` },
  { key: 'stats', label: 'Stats', href: (u: string) => `/${u}/stats` },
  { key: 'listes', label: 'Listes', href: (u: string) => `/${u}/lists` },
] as const

export function ProfileNav({ username, active }: ProfileNavProps) {
  return (
    <div className="border-border mb-6 flex gap-1 overflow-x-auto border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href(username)}
          className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors ${
            active === tab.key
              ? 'text-foreground border-b-2 border-current'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
