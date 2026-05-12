'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trash2, AlertTriangle } from 'lucide-react'
import { RatingStars } from './RatingStars'
import { deleteReview } from '@/app/actions/log'
import type { Review } from '@/lib/types'

interface ReviewCardProps {
  review: Review
  currentUserId?: string
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const router = useRouter()
  const [revealed, setRevealed] = useState(!review.contains_spoilers)
  const [deleting, setDeleting] = useState(false)
  const isOwner = currentUserId === review.user_id
  const profile = review.profile

  async function handleDelete() {
    if (!confirm('Supprimer cette review ?')) return
    setDeleting(true)
    await deleteReview(review.id)
    router.refresh()
  }

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href={`/${profile?.username}`} className="text-sm font-semibold hover:underline">
            @{profile?.username ?? '?'}
          </a>
          {review.rating && <RatingStars value={review.rating} readOnly size="sm" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(review.created_at), { locale: fr, addSuffix: true })}
          </span>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Supprimer la review"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      {review.contains_spoilers && !revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="border-border flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-3 text-sm"
        >
          <AlertTriangle className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground">
            Contient des spoilers — cliquer pour afficher
          </span>
        </button>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.content}</p>
      )}
    </div>
  )
}
