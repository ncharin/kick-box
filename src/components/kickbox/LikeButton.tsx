'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/app/actions/social'

interface LikeButtonProps {
  reviewId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ reviewId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setLiked((prev) => !prev)
    setCount((prev) => (liked ? prev - 1 : prev + 1))
    const result = await toggleLike(reviewId, liked)
    if (result.error) {
      setLiked(liked)
      setCount(count)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1 text-xs transition-colors ${
        liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
      }`}
      aria-label={liked ? 'Ne plus liker' : 'Liker'}
    >
      <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
