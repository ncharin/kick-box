'use client'

import { useState } from 'react'
import { ListPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addMatchToList } from '@/app/actions/social'

interface UserList {
  id: string
  name: string
  matches_count: number
}

interface AddToListButtonProps {
  matchId: number
  userLists: UserList[]
  listIdsContaining: string[]
}

export function AddToListButton({ matchId, userLists, listIdsContaining }: AddToListButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [added, setAdded] = useState(new Set(listIdsContaining))
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(listId: string) {
    if (added.has(listId)) return
    setLoading(listId)
    setError(null)
    const result = await addMatchToList(listId, matchId)
    setLoading(null)
    if (result.error) {
      setError(result.error)
    } else {
      setAdded((prev) => new Set([...prev, listId]))
    }
  }

  if (userLists.length === 0) return null

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <ListPlus className="h-4 w-4" />
        Ajouter à une liste
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="border-border bg-card relative z-10 w-full max-w-sm rounded-xl border p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Ajouter à une liste</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-md p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {userLists.map((list) => {
                const isIn = added.has(list.id)
                return (
                  <button
                    key={list.id}
                    onClick={() => handleAdd(list.id)}
                    disabled={isIn || loading === list.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      isIn
                        ? 'border-primary/30 bg-primary/5 text-primary cursor-default'
                        : 'border-border hover:bg-muted cursor-pointer'
                    }`}
                  >
                    <span>{list.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {isIn ? '✓ Ajouté' : `${list.matches_count} matchs`}
                    </span>
                  </button>
                )
              })}
            </div>

            {error && <p className="text-destructive mt-3 text-xs">{error}</p>}
          </div>
        </div>
      )}
    </>
  )
}
