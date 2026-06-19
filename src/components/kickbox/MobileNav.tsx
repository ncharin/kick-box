'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Users, Activity, Search } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/discover', label: 'Découvrir', icon: Home },
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/activity', label: 'Activité', icon: Activity },
  { href: '/community', label: 'Communauté', icon: Users },
  { href: '/competitions', label: 'Compétitions', icon: Compass },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="border-border bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur sm:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] leading-none font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
