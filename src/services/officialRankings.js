import { getCurrentUser } from './auth';
import { requireSupabase } from './supabaseClient';

const OFFICIAL_RANKINGS_TABLE = 'official_rankings';

async function getOfficialRankingRecord(sessionKey) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(OFFICIAL_RANKINGS_TABLE)
        .select('ranking_codes, is_published')
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
        isPublished: Boolean(data.is_published),
    };
}

export async function getOfficialRankingState(sessionKey) {
    return getOfficialRankingRecord(sessionKey);
}

export async function getPublishedOfficialRankingCodes(sessionKey) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(OFFICIAL_RANKINGS_TABLE)
        .select('ranking_codes')
        .eq('session_key', sessionKey)
        .eq('is_published', true)
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

export async function setOfficialRankingPublished(sessionKey, isPublished) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(OFFICIAL_RANKINGS_TABLE)
        .update({
            is_published: isPublished,
            updated_by: user.id,
        })
        .eq('session_key', sessionKey)
        .select('is_published')
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error('Aucun classement officiel sauvegarde.');
    }

    return Boolean(data.is_published);
}
