'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, deleteAccount } from '@/app/actions/social'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name ?? '')
        setUsername(profile.username ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Image trop volumineuse (max 2 Mo)')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Fichier invalide — image uniquement')
      return
    }

    setUploadingAvatar(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError("Erreur lors de l'upload de l'avatar")
      setUploadingAvatar(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      setError('Erreur lors de la mise à jour du profil')
    } else {
      setAvatarUrl(publicUrl)
    }

    setUploadingAvatar(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile({ displayName, username, bio })
    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      if (result.username) router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="text-muted-foreground text-sm">Chargement…</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1 text-sm">Modifier votre profil public</p>
      </div>

      {/* Avatar */}
      <div className="border-border mb-6 rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
                {(displayName || username || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Photo de profil</p>
            <p className="text-muted-foreground mt-0.5 text-xs">JPG, PNG, WebP — max 2 Mo</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="border-border hover:bg-muted mt-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? 'Upload en cours…' : 'Changer la photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display-name">Nom affiché</Label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ton nom affiché"
            maxLength={50}
            className="border-border bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Nom d&apos;utilisateur</Label>
          <div className="flex items-center">
            <span className="border-border bg-muted text-muted-foreground flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm">
              @
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="ton_username"
              minLength={3}
              maxLength={24}
              required
              className="border-border bg-background text-foreground flex h-9 flex-1 rounded-l-none rounded-r-md border px-3 py-1 text-sm"
            />
          </div>
          <p className="text-muted-foreground text-xs">
            3–24 caractères, lettres minuscules, chiffres, underscore
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Décris-toi en quelques mots…"
            maxLength={280}
            rows={3}
            className="resize-none"
          />
          <p className="text-muted-foreground text-right text-xs">{bio.length}/280</p>
        </div>

        {error && (
          <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">{error}</p>
        )}
        {success && (
          <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">
            Profil mis à jour !
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>

      {/* Zone danger */}
      <div className="border-destructive/30 mt-10 rounded-lg border p-4">
        <h2 className="text-destructive mb-1 text-sm font-semibold">Zone dangereuse</h2>
        <p className="text-muted-foreground mb-4 text-xs">
          La suppression de votre compte est irréversible. Toutes vos données (journal, reviews,
          listes) seront définitivement supprimées.
        </p>
        <Button
          variant="destructive"
          size="sm"
          disabled={deletingAccount}
          onClick={async () => {
            const confirmed = confirm(
              'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
            )
            if (!confirmed) return
            const confirmed2 = confirm(
              'Dernière confirmation : toutes vos données seront effacées définitivement.'
            )
            if (!confirmed2) return
            setDeletingAccount(true)
            const result = await deleteAccount()
            if (result?.error) {
              setError(result.error)
              setDeletingAccount(false)
            } else {
              router.push('/')
            }
          }}
        >
          {deletingAccount ? 'Suppression…' : 'Supprimer mon compte'}
        </Button>
      </div>
    </div>
  )
}
