'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Log un match (diary_entry + review optionnelle)
export async function logMatch(formData: {
  matchId: number
  watchedOn: string
  rating: number | null
  isRewatch: boolean
  reviewContent: string
  containsSpoilers: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { matchId, watchedOn, rating, isRewatch, reviewContent, containsSpoilers } = formData

  // Créer la review si contenu non vide
  let reviewId: string | null = null
  if (reviewContent.trim().length > 0) {
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        match_id: matchId,
        content: reviewContent.trim(),
        rating,
        contains_spoilers: containsSpoilers,
      })
      .select('id')
      .single()

    if (reviewError) return { error: reviewError.message }
    reviewId = review.id
  }

  // Créer l'entrée diary
  const { error: diaryError } = await supabase.from('diary_entries').upsert(
    {
      user_id: user.id,
      match_id: matchId,
      watched_on: watchedOn,
      rating,
      review_id: reviewId,
      is_rewatch: isRewatch,
    },
    { onConflict: 'user_id,match_id', ignoreDuplicates: false }
  )

  if (diaryError) {
    // Si conflit unique index (pas un rewatch, déjà loggé) — on met à jour
    if (diaryError.code === '23505') {
      await supabase
        .from('diary_entries')
        .update({ watched_on: watchedOn, rating, review_id: reviewId })
        .eq('user_id', user.id)
        .eq('match_id', matchId)
        .eq('is_rewatch', false)
    } else {
      return { error: diaryError.message }
    }
  }

  revalidatePath(`/matches/${matchId}`)
  revalidatePath('/[username]/diary', 'page')
  return { success: true }
}

// Supprimer une entrée diary
export async function removeFromDiary(matchId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await supabase
    .from('diary_entries')
    .delete()
    .eq('user_id', user.id)
    .eq('match_id', matchId)
    .eq('is_rewatch', false)

  revalidatePath(`/matches/${matchId}`)
  return { success: true }
}

// Supprimer une review
export async function deleteReview(reviewId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/[username]/reviews', 'page')
  return { success: true }
}

// Ajouter / retirer de la watchlist
export async function toggleWatchlist(matchId: number, currentlyInList: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  if (currentlyInList) {
    await supabase.from('watchlist').delete().eq('user_id', user.id).eq('match_id', matchId)
  } else {
    await supabase.from('watchlist').insert({ user_id: user.id, match_id: matchId })
  }

  revalidatePath(`/matches/${matchId}`)
  revalidatePath('/[username]/watchlist', 'page')
  return { success: true }
}
