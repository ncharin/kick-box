'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { addComment, deleteComment } from '@/app/actions/social'
import { UserAvatar } from '@/components/kickbox/UserAvatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  // Supabase retourne le profil joint comme array ou objet selon le contexte
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any
}

interface CommentSectionProps {
  reviewId: string
  initialComments: Comment[]
  currentUserId?: string
}

export function CommentSection({ reviewId, initialComments, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)

    startTransition(async () => {
      const result = await addComment(reviewId, text.trim())
      if (result.error) {
        setError(result.error)
      } else {
        // Ajout optimiste
        const newComment: Comment = {
          id: crypto.randomUUID(),
          content: text.trim(),
          created_at: new Date().toISOString(),
          user_id: currentUserId!,
          profile: null, // sera rechargé au prochain render
        }
        setComments((prev) => [...prev, newComment])
        setText('')
      }
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    })
  }

  return (
    <div className="border-border mt-3 border-t pt-3">
      {comments.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {comments.map((comment) => {
            // Le profil peut être un tableau (Supabase join) ou un objet direct
            const prof = Array.isArray(comment.profile) ? comment.profile[0] : comment.profile
            return (
              <div key={comment.id} className="flex items-start gap-2 text-sm">
                {prof?.avatar_url ? (
                  <UserAvatar
                    url={prof.avatar_url}
                    name={prof.display_name ?? prof.username}
                    size={20}
                  />
                ) : (
                  <div className="bg-muted mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    {(prof?.display_name ?? prof?.username ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="mr-1 text-xs font-medium">
                    {prof?.display_name ?? prof?.username ?? 'Utilisateur'}
                  </span>
                  <span className="text-foreground/80 text-xs">{comment.content}</span>
                  <span className="text-muted-foreground ml-2 text-[10px]">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ajouter un commentaire…"
            rows={1}
            maxLength={1000}
            className="min-h-0 resize-none py-1.5 text-sm"
          />
          <Button type="submit" size="sm" disabled={!text.trim() || isPending} variant="outline">
            Envoyer
          </Button>
        </form>
      )}
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  )
}
