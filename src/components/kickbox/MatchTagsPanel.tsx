'use client'

import { useState, useTransition } from 'react'
import { toggleMatchTag } from '@/app/actions/social'

interface Tag {
  id: number
  name: string
  slug: string
  emoji: string
}

interface MatchTagsPanelProps {
  matchId: number
  allTags: Tag[]
  userTagIds: number[]
  tagCounts: Record<number, number>
}

export function MatchTagsPanel({ matchId, allTags, userTagIds, tagCounts }: MatchTagsPanelProps) {
  const [optimisticUserTags, setOptimisticUserTags] = useState(new Set(userTagIds))
  const [optimisticCounts, setOptimisticCounts] = useState({ ...tagCounts })
  const [isPending, startTransition] = useTransition()

  function handleTag(tagId: number) {
    const hasTag = optimisticUserTags.has(tagId)
    setOptimisticUserTags((prev) => {
      const next = new Set(prev)
      if (hasTag) next.delete(tagId)
      else next.add(tagId)
      return next
    })
    setOptimisticCounts((prev) => ({
      ...prev,
      [tagId]: Math.max(0, (prev[tagId] ?? 0) + (hasTag ? -1 : 1)),
    }))

    startTransition(async () => {
      await toggleMatchTag(matchId, tagId, hasTag)
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const active = optimisticUserTags.has(tag.id)
        const count = optimisticCounts[tag.id] ?? 0
        return (
          <button
            key={tag.id}
            onClick={() => handleTag(tag.id)}
            disabled={isPending}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            <span>{tag.emoji}</span>
            <span>{tag.name}</span>
            {count > 0 && <span className="opacity-60">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
