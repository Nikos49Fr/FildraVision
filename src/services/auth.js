import { requireSupabase } from './supabaseClient';

function getAuthRedirectUrl() {
    return window.location.href;
}

export async function getCurrentUser() {
    const supabase = requireSupabase();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return user;
}

export async function loginWithTwitch() {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
            redirectTo: getAuthRedirectUrl(),
        },
    });

    if (error) {
        throw error;
    }
}

export async function logout() {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export function subscribeToAuthChanges(callback) {
    const supabase = requireSupabase();
    return supabase.auth.onAuthStateChange(callback);
}
