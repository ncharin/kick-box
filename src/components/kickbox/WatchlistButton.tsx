'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleWatchlist } from '@/app/actions/log'

interface WatchlistButtonProps {
  matchId: number
  isInWatchlist: boolean
}

export function WatchlistButton({ matchId, isInWatchlist: initialState }: WatchlistButtonProps) {
  const router = useRouter()
  const [inList, setInList] = useState(initialState)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setInList((prev) => !prev) // optimistic update
    const result = await toggleWatchlist(matchId, inList)
    if (result.error) setInList(inList) // rollback
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading} className="gap-2">
      {inList ? (
        <BookmarkCheck className="text-primary h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {inList ? 'Dans ma watchlist' : 'Watchlist'}
    </Button>
  )
}
