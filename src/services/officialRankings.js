import { getCurrentUser } from './auth';
import { requireSupabase } from './supabaseClient';

const OFFICIAL_RANKINGS_TABLE = 'official_rankings';

export async function getOfficialRankingCodes(sessionKey) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(OFFICIAL_RANKINGS_TABLE)
        .select('ranking_codes')
        .eq('session_key', sessionKey)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data?.ranking_codes ?? null;
}

export async function saveOfficialRankingCodes(sessionKey, rankingCodes) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    if (!Array.isArray(rankingCodes) || rankingCodes.length === 0) {
        throw new Error('Classement officiel invalide.');
    }

    const safeRankingCodes = rankingCodes.filter(
        (rankingCode) =>
            typeof rankingCode === 'string' && rankingCode.length > 0,
    );

    const supabase = requireSupabase();
    const payload = {
        session_key: sessionKey,
        ranking_codes: safeRankingCodes,
        updated_by: user.id,
    };

    const { data, error } = await supabase
        .from(OFFICIAL_RANKINGS_TABLE)
        .upsert(payload, { onConflict: 'session_key' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}
