import { getCurrentUser } from './auth';
import { requireSupabase } from './supabaseClient';

const COMMUNITY_RESULTS_TABLE = 'community_results';
const PROFILES_TABLE = 'profiles';
const USER_RANKINGS_TABLE = 'user_rankings';

export async function getCommunityResult(sessionKey) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
        .from(COMMUNITY_RESULTS_TABLE)
        .select('status, voter_count, ranking_snapshot, published_at')
        .eq('session_key', sessionKey)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    return {
        status: data.status ?? 'idle',
        voterCount: data.voter_count ?? 0,
        rankingSnapshot: data.ranking_snapshot ?? null,
        publishedAt: data.published_at ?? null,
    };
}

export async function getSessionUserRankings(sessionKey) {
    const supabase = requireSupabase();
    const { data: userRankings, error: userRankingsError } = await supabase
        .from(USER_RANKINGS_TABLE)
        .select('user_id, ranking_codes, created_at')
        .eq('session_key', sessionKey)
        .order('created_at', { ascending: true });

    if (userRankingsError) {
        throw userRankingsError;
    }

    const userIds = [...new Set(userRankings.map((userRanking) => userRanking.user_id))];

    if (userIds.length === 0) {
        return [];
    }

    const { data: profiles, error: profilesError } = await supabase
        .from(PROFILES_TABLE)
        .select('id, display_name, avatar_url')
        .in('id', userIds);

    if (profilesError) {
        throw profilesError;
    }

    const profilesById = new Map(
        profiles.map((profile) => [profile.id, profile]),
    );

    return userRankings.map((userRanking) => {
        const profile = profilesById.get(userRanking.user_id);

        return {
            userId: userRanking.user_id,
            rankingCodes: userRanking.ranking_codes ?? [],
            createdAt: userRanking.created_at ?? null,
            displayName: profile?.display_name ?? userRanking.user_id,
            avatarUrl: profile?.avatar_url ?? null,
        };
    });
}

export async function setCommunityResultRevealing(sessionKey, voterCount) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    const supabase = requireSupabase();
    const payload = {
        session_key: sessionKey,
        status: 'revealing',
        voter_count: voterCount,
        updated_by: user.id,
    };

    const { data, error } = await supabase
        .from(COMMUNITY_RESULTS_TABLE)
        .upsert(payload, { onConflict: 'session_key' })
        .select('status, voter_count')
        .single();

    if (error) {
        throw error;
    }

    return {
        status: data.status ?? 'revealing',
        voterCount: data.voter_count ?? voterCount,
    };
}

export async function publishCommunityResult(
    sessionKey,
    {
        voterCount,
        rankingSnapshot,
    },
) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    const supabase = requireSupabase();
    const payload = {
        session_key: sessionKey,
        status: 'published',
        voter_count: voterCount,
        ranking_snapshot: rankingSnapshot,
        published_at: new Date().toISOString(),
        updated_by: user.id,
    };

    const { data, error } = await supabase
        .from(COMMUNITY_RESULTS_TABLE)
        .upsert(payload, { onConflict: 'session_key' })
        .select('status, voter_count, ranking_snapshot, published_at')
        .single();

    if (error) {
        throw error;
    }

    return {
        status: data.status ?? 'published',
        voterCount: data.voter_count ?? voterCount,
        rankingSnapshot: data.ranking_snapshot ?? rankingSnapshot,
        publishedAt: data.published_at ?? null,
    };
}

export async function unpublishCommunityResult(sessionKey) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non connecte.');
    }

    const supabase = requireSupabase();
    const { error } = await supabase
        .from(COMMUNITY_RESULTS_TABLE)
        .delete()
        .eq('session_key', sessionKey);

    if (error) {
        throw error;
    }

    return null;
}
