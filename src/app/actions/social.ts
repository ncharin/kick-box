'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleFollow(targetUserId: string, isFollowing: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  if (user.id === targetUserId) return { error: 'Tu ne peux pas te suivre toi-même' }

  if (isFollowing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (error) return { error: error.message }
    // Notification de follow
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'follow',
      actor_id: user.id,
    })
  }

  revalidatePath('/[username]', 'page')
  revalidatePath('/activity')
  return { success: true }
}

export async function toggleLike(reviewId: string, isLiked: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  if (isLiked) {
    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('review_id', reviewId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('review_likes')
      .insert({ user_id: user.id, review_id: reviewId })
    if (error) return { error: error.message }
    // Notification de like (on ne notifie pas si on like sa propre review)
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id, match_id')
      .eq('id', reviewId)
      .single()
    if (review && review.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: review.user_id,
        type: 'like',
        actor_id: user.id,
        review_id: reviewId,
        match_id: review.match_id,
      })
    }
  }

  return { success: true }
}

export async function toggleMatchTag(matchId: number, tagId: number, hasTag: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  if (hasTag) {
    const { error } = await supabase
      .from('match_tags')
      .delete()
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .eq('tag_id', tagId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('match_tags')
      .insert({ user_id: user.id, match_id: matchId, tag_id: tagId })
    if (error) return { error: error.message }
  }

  revalidatePath(`/matches/${matchId}`)
  return { success: true }
}

export async function updateProfile(formData: {
  displayName: string
  username: string
  bio: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { displayName, username, bio } = formData

  if (username.length < 3 || username.length > 24) {
    return { error: "Le nom d'utilisateur doit faire entre 3 et 24 caractères" }
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: 'Caractères autorisés : lettres minuscules, chiffres, underscore' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName.trim() || null,
      username: username.toLowerCase().trim(),
      bio: bio.trim() || null,
    })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') return { error: "Ce nom d'utilisateur est déjà pris" }
    return { error: error.message }
  }

  revalidatePath('/[username]', 'page')
  revalidatePath('/settings')
  return { success: true, username: username.toLowerCase().trim() }
}

export async function createList(formData: {
  name: string
  description: string
  isPublic: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: user.id,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      is_public: formData.isPublic,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/[username]/lists', 'page')
  return { success: true, listId: data.id }
}

export async function addMatchToList(listId: string, matchId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('list_matches')
    .insert({ list_id: listId, match_id: matchId })
  if (error) {
    if (error.code === '23505') return { error: 'Déjà dans cette liste' }
    return { error: error.message }
  }

  revalidatePath(`/lists/${listId}`)
  return { success: true }
}

export async function removeMatchFromList(listId: string, matchId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('list_matches')
    .delete()
    .eq('list_id', listId)
    .eq('match_id', matchId)

  if (error) return { error: error.message }
  revalidatePath(`/lists/${listId}`)
  return { success: true }
}

export async function addComment(reviewId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return { error: 'Commentaire invalide' }

  const { error } = await supabase
    .from('review_comments')
    .insert({ user_id: user.id, review_id: reviewId, content: trimmed })

  if (error) return { error: error.message }

  // Notification de commentaire
  const { data: review } = await supabase
    .from('reviews')
    .select('user_id, match_id')
    .eq('id', reviewId)
    .single()
  if (review && review.user_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: review.user_id,
      type: 'comment',
      actor_id: user.id,
      review_id: reviewId,
      match_id: review.match_id,
    })
  }

  revalidatePath('/matches/[id]', 'page')
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('review_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/matches/[id]', 'page')
  return { success: true }
}

export async function markNotificationsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  revalidatePath('/notifications')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Supprimer l'avatar du storage
  await supabase.storage
    .from('avatars')
    .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`])

  // Supprimer le compte via le client admin (cascade toutes les données)
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  // Déconnecter la session locale
  await supabase.auth.signOut()
  return { success: true }
}

export async function deleteList(listId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('lists').delete().eq('id', listId).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/[username]/lists', 'page')
  return { success: true }
}
