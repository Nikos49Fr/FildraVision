import { requireSupabase } from './supabaseClient';

function getUsername(user) {
    return (
        user.user_metadata?.name ||
        user.id
    );
}

function getDisplayName(user) {
    return (
        user.user_metadata?.nickname ||
        user.user_metadata?.slug ||
        user.user_metadata?.name ||
        user.id
    );
}

function getAvatarUrl(user) {
    return user.user_metadata?.avatar_url || null;
}

export async function upsertProfileFromUser(user) {
    if (!user) {
        return null;
    }

    const supabase = requireSupabase();
    const profilePayload = {
        id: user.id,
        username: getUsername(user),
        display_name: getDisplayName(user),
        avatar_url: getAvatarUrl(user),
    };

    const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getCurrentProfile() {
    const supabase = requireSupabase();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}
