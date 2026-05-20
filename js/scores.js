/* ==============================================
   SCORES.JS — Vocabria
   Handles: saving scores, fetching leaderboard
============================================== */

import { supabase } from './supabase.js'
import { getCurrentUser, getUsername } from './auth.js'


/* ---------- SAVE SCORE ----------
   Saves to leaderboard only if it's a new personal best.
   Silently skips if user is not logged in.
---------------------------------------- */
export async function saveScore(game, score) {

    const user = await getCurrentUser()
    if (!user) {
        console.log('saveScore: no user logged in, skipping.')
        return { success: false, message: 'Not logged in' }
    }

    /* Get username — never use email */
    const username = await getUsername(user.id)

    /* Check existing best score for this game */
    const { data: existing } = await supabase
        .from('leaderboard')
        .select('id, score')
        .eq('user_id', user.id)
        .eq('game', game)
        .maybeSingle()

    /* Skip if existing score is already higher or equal */
    if (existing && existing.score >= score) {
        console.log(`saveScore: existing score (${existing.score}) >= new score (${score}), skipping.`)
        return { success: false, message: 'Not a new personal best' }
    }

    let error

    if (existing) {
        /* UPDATE existing row */
        const { error: updateError } = await supabase
            .from('leaderboard')
            .update({ score, username })
            .eq('id', existing.id)
        error = updateError
    } else {
        /* INSERT new row */
        const { error: insertError } = await supabase
            .from('leaderboard')
            .insert({ user_id: user.id, username, game, score })
        error = insertError
    }

    if (error) {
        console.error('saveScore error:', error.message)
        return { success: false, message: error.message }
    }

    console.log(`saveScore: saved ${game} = ${score} for ${username}`)
    return { success: true }
}


/* ---------- FETCH LEADERBOARD ----------
   Returns top players sorted by score descending.
   game: 'all' | 'Quiz' | 'Scramble' | 'Memory' | 'Fill in Blank'
---------------------------------------- */
export async function fetchLeaderboard(game = 'all', limit = 20) {

    let query = supabase
        .from('leaderboard')
        .select('id, user_id, username, game, score')
        .order('score', { ascending: false })
        .limit(limit)

    if (game !== 'all') {
        query = query.eq('game', game)
    }

    const { data, error } = await query

    if (error) {
        console.error('fetchLeaderboard error:', error.message)
        return []
    }

    return data ?? []
}


/* ---------- FETCH MY SCORES ---------- */
export async function fetchMyScores() {

    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('leaderboard')
        .select('game, score')
        .eq('user_id', user.id)
        .order('score', { ascending: false })

    if (error) return []
    return data ?? []
}
