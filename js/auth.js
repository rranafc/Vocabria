/* ==============================================
   AUTH.JS — Vocabria
   Handles: sign up, log in, log out, session
============================================== */

import { supabase } from './supabase.js'


/* ---------- SIGN UP ---------- */
export async function signUp(username, email, password) {

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
    })

    if (error) return { success: false, message: error.message }

    const userId = data.user?.id
    if (userId) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: userId, username })
        if (profileError) console.error('Profile insert error:', profileError.message)
    }

    return { success: true, message: 'Account created! Check your email to confirm.' }
}


/* ---------- LOG IN ---------- */
export async function logIn(email, password) {

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { success: false, message: error.message }

    const user = data.user
    if (user) {
        const username = user.user_metadata?.username
        if (username) {
            await supabase
                .from('profiles')
                .upsert({ id: user.id, username }, { onConflict: 'id', ignoreDuplicates: true })
        }
    }

    return { success: true, user: data.user }
}


/* ---------- LOG OUT ---------- */
export async function logOut() {
    await supabase.auth.signOut()
    const depth = window.location.pathname.split('/').filter(Boolean).length
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : ''
    window.location.href = prefix + 'index.html'
}


/* ---------- GET CURRENT USER ---------- */
export async function getCurrentUser() {
    const { data } = await supabase.auth.getUser()
    return data?.user ?? null
}


/* ---------- GET USERNAME ---------- */
export async function getUsername(userId) {

    const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle()

    if (data?.username) return data.username

    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.username) return user.user_metadata.username

    return user?.email?.split('@')[0] ?? 'Player'
}



export async function updateHeader() {

    /* Grab elements first — before any async work */
    const navButtons =
        document.getElementById('nav-buttons') ??
        document.querySelector('.nav-buttons')

    const mobileNavButtons =
        document.getElementById('mobile-nav-buttons') ??
        document.querySelector('.mobile-nav-buttons')

    const user = await getCurrentUser()

    if (user) {
        const username = await getUsername(user.id)

        const loggedInHTML = `
            <span class="nav-username">👋 ${username}</span>
            <button class="logout-btn" id="logout-btn">Log Out</button>
        `

        if (navButtons)       navButtons.innerHTML       = loggedInHTML
        if (mobileNavButtons) mobileNavButtons.innerHTML = loggedInHTML

        /* Bind logout after injecting HTML */
        document.querySelectorAll('#logout-btn, .logout-btn').forEach(btn => {
            btn.addEventListener('click', logOut)
        })
    }

    /* Always reveal — logged in or not — so buttons never stay hidden */
    if (navButtons)       navButtons.style.visibility = 'visible'
    if (mobileNavButtons) mobileNavButtons.style.visibility = 'visible'
}
