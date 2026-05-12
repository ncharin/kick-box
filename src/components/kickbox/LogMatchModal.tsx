'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RatingStars } from './RatingStars'
import { logMatch } from '@/app/actions/log'

interface LogMatchModalProps {
  matchId: number
  matchLabel: string // ex: "PSG vs Monaco"
  isLogged: boolean
  existingRating?: number | null
}

export function LogMatchModal({
  matchId,
  matchLabel,
  isLogged,
  existingRating,
}: LogMatchModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rating, setRating] = useState<number | null>(existingRating ?? null)
  const [watchedOn, setWatchedOn] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reviewContent, setReviewContent] = useState('')
  const [containsSpoilers, setContainsSpoilers] = useState(false)
  const [isRewatch, setIsRewatch] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await logMatch({
      matchId,
      watchedOn,
      rating,
      isRewatch,
      reviewContent,
      containsSpoilers,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={`inline-flex h-8 w-full items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-all sm:w-auto ${
          isLogged
            ? 'border-border bg-background hover:bg-muted'
            : 'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent'
        }`}
      >
        {isLogged ? '✓ Loggé' : '+ Logger ce match'}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{matchLabel}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* Date de visionnage */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="watched-on">Vu le</Label>
            <input
              id="watched-on"
              type="date"
              value={watchedOn}
              onChange={(e) => setWatchedOn(e.target.value)}
              className="bg-background border-border text-foreground flex h-8 w-full rounded-md border px-3 py-1 text-sm"
              required
            />
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <Label>Note</Label>
            <div className="flex items-center gap-3">
              <RatingStars value={rating} onChange={setRating} size="lg" />
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Review */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review">Review (optionnel)</Label>
            <Textarea
              id="review"
              placeholder="Ton avis sur ce match…"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              maxLength={5000}
              rows={4}
              className="resize-none"
            />
            <p className="text-muted-foreground text-right text-xs">{reviewContent.length}/5000</p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="rounded"
              />
              <span>Ma review contient des spoilers</span>
            </label>
            {isLogged && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isRewatch}
                  onChange={(e) => setIsRewatch(e.target.checked)}
                  className="rounded"
                />
                <span>C&apos;est un revisionnage</span>
              </label>
            )}
          </div>

          {error && (
            <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
