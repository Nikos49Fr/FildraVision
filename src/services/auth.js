import { requireSupabase } from './supabaseClient';

function getAuthRedirectUrl() {
    const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
        return window.location.href;
    }

    return new URL(import.meta.env.BASE_URL, window.location.href).toString();
}

export async function getCurrentUser() {
    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return data.user;
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
