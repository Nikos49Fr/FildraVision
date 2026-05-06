import { getCurrentUser } from './auth';
import { requireSupabase } from './supabaseClient';

const VOTE_AVAILABILITY_TABLE = 'vote_availability';

function isPermissionDeniedError(error) {
    return (
        error?.code === '42501' ||
        error?.message?.toLowerCase().includes('permission denied')
    );
}

export async function getOpenVoteSessionKey() {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(VOTE_AVAILABILITY_TABLE)
        .select('session_key')
        .eq('is_open', true)
        .maybeSingle();

    if (error) {
        if (isPermissionDeniedError(error)) {
            return null;
        }

        throw error;
    }

    return data?.session_key ?? null;
}

export async function setOpenVoteSessionKey(sessionKey) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    const supabase = requireSupabase();
    const { error: closeError } = await supabase
        .from(VOTE_AVAILABILITY_TABLE)
        .update({
            is_open: false,
            updated_by: user.id,
        })
        .neq('session_key', '');

    if (closeError) {
        throw closeError;
    }

    if (!sessionKey) {
        return null;
    }

    const payload = {
        session_key: sessionKey,
        is_open: true,
        updated_by: user.id,
    };

    const { data, error } = await supabase
        .from(VOTE_AVAILABILITY_TABLE)
        .upsert(payload, { onConflict: 'session_key' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data?.session_key ?? sessionKey;
}
