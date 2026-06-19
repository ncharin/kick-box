'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/app/actions/social'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setIsFollowing((prev) => !prev) // optimistic
    const result = await toggleFollow(targetUserId, isFollowing)
    if (result.error) setIsFollowing(isFollowing) // rollback
    setLoading(false)
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      {isFollowing ? 'Abonné' : 'Suivre'}
    </Button>
  )
}
