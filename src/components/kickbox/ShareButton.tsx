'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  title: string
  url: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function ShareButton({ title, url, variant = 'outline' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl })
        return
      } catch {
        // Annulé par l'utilisateur ou non supporté, fallback clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard non disponible
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={handleShare} className="gap-2">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Lien copié !' : 'Partager'}
    </Button>
  )
}
