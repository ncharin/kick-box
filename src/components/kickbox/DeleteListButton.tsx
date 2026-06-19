'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteList } from '@/app/actions/social'

interface DeleteListButtonProps {
  listId: string
  username: string
}

export function DeleteListButton({ listId, username }: DeleteListButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer cette liste ? Cette action est irréversible.')) return
    setLoading(true)
    await deleteList(listId)
    router.push(`/${username}/lists`)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive gap-1.5"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Supprimer
    </Button>
  )
}
