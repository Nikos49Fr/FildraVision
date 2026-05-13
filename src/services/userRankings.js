import { getCurrentUser } from './auth';
import { requireSupabase } from './supabaseClient';

const USER_RANKINGS_TABLE = 'user_rankings';

export async function getUserRankingState(sessionKey) {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(USER_RANKINGS_TABLE)
        .select('ranking_codes, board_state')
        .eq('user_id', user.id)
        .eq('session_key', sessionKey)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    return {
        rankingCodes: data.ranking_codes ?? null,
        boardState: data.board_state ?? null,
    };
}

export async function saveUserRankingState(
    sessionKey,
    {
        rankingCodes,
        boardState,
    },
) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    if (!Array.isArray(rankingCodes) || rankingCodes.length === 0) {
        throw new Error('Classement utilisateur invalide.');
    }

    const safeRankingCodes = rankingCodes.filter(
        (rankingCode) =>
            typeof rankingCode === 'string' && rankingCode.length > 0,
    );

    const supabase = requireSupabase();
    const payload = {
        user_id: user.id,
        session_key: sessionKey,
        ranking_codes: safeRankingCodes,
        board_state: boardState,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from(USER_RANKINGS_TABLE)
        .upsert(payload, { onConflict: 'user_id,session_key' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return {
        rankingCodes: data.ranking_codes ?? safeRankingCodes,
        boardState: data.board_state ?? boardState,
    };
}

export async function deleteUserRankingState(sessionKey) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    const supabase = requireSupabase();
    const { error } = await supabase
        .from(USER_RANKINGS_TABLE)
        .delete()
        .eq('user_id', user.id)
        .eq('session_key', sessionKey);

    if (error) {
        throw error;
    }

    return true;
}
