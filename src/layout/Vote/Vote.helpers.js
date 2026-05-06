import {
    semiFinal1Participants,
    semiFinal2Participants,
    finalParticipants,
} from '../../datas/countries';
import {
    USER_RANKING_LOCAL_STORAGE_KEYS,
    USER_RANKING_SESSIONS,
    getRankingSaveStatus,
    saveStoredRankingCodes,
} from '../../utils/helpers/rankingsPersistence';

export const USER_RANKING_SOURCE_ID = 'vote-source';

export const VOTE_TIER_LIST = [
    { id: 'vote-tier-s', label: 'S' },
    { id: 'vote-tier-a', label: 'A' },
    { id: 'vote-tier-b', label: 'B' },
    { id: 'vote-tier-c', label: 'C' },
    { id: 'vote-tier-d', label: 'D' },
];

export const VOTE_SESSION_CONFIGS = {
    [USER_RANKING_SESSIONS.semiFinal1UserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.semiFinal1UserRanking,
        storageKey: USER_RANKING_LOCAL_STORAGE_KEYS.semiFinal1UserRanking,
        title: 'Demi-Finale 1',
        participantCodes: semiFinal1Participants,
    },
    [USER_RANKING_SESSIONS.semiFinal2UserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.semiFinal2UserRanking,
        storageKey: USER_RANKING_LOCAL_STORAGE_KEYS.semiFinal2UserRanking,
        title: 'Demi-Finale 2',
        participantCodes: semiFinal2Participants,
    },
    [USER_RANKING_SESSIONS.finalUserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.finalUserRanking,
        storageKey: USER_RANKING_LOCAL_STORAGE_KEYS.finalUserRanking,
        title: 'Grande Finale',
        participantCodes: finalParticipants,
    },
};

export const DEFAULT_VOTE_SESSION_CONFIG =
    VOTE_SESSION_CONFIGS[USER_RANKING_SESSIONS.semiFinal1UserRanking];

function getParticipantsByCode(allParticipants) {
    return allParticipants.reduce((acc, participant) => {
        acc[participant.code] = participant;
        return acc;
    }, {});
}

export function getParticipantsFromCodes(participantCodes, allParticipants) {
    const participantsByCode = getParticipantsByCode(allParticipants);

    return participantCodes
        .map((code) => participantsByCode[code])
        .filter(Boolean);
}

export function getDefaultVoteBoardState(
    fallbackParticipantCodes,
    allParticipants,
    tiers,
) {
    const participantsByCode = getParticipantsByCode(allParticipants);

    return {
        source: fallbackParticipantCodes
            .map((code) => participantsByCode[code])
            .filter(Boolean),
        tiers: Object.fromEntries(tiers.map((tier) => [tier.id, []])),
    };
}

function sanitizeTierRankingStorage(
    storedValue,
    fallbackParticipantCodes,
    allParticipants,
    tiers,
) {
    const participantsByCode = getParticipantsByCode(allParticipants);
    const validCodes = new Set(fallbackParticipantCodes);
    const uniqueCodes = new Set();
    const tierEntries = Object.fromEntries(tiers.map((tier) => [tier.id, []]));

    if (storedValue && typeof storedValue === 'object') {
        for (const tier of tiers) {
            const tierCodes = storedValue.tiers?.[tier.id];

            if (!Array.isArray(tierCodes)) {
                continue;
            }

            tierEntries[tier.id] = tierCodes
                .filter(
                    (code) =>
                        typeof code === 'string' &&
                        validCodes.has(code) &&
                        !uniqueCodes.has(code),
                )
                .map((code) => {
                    uniqueCodes.add(code);
                    return participantsByCode[code];
                })
                .filter(Boolean);
        }
    }

    const storedSourceCodes = Array.isArray(storedValue?.source)
        ? storedValue.source
        : [];
    const source = storedSourceCodes
        .filter(
            (code) =>
                typeof code === 'string' &&
                validCodes.has(code) &&
                !uniqueCodes.has(code),
        )
        .map((code) => {
            uniqueCodes.add(code);
            return participantsByCode[code];
        })
        .filter(Boolean);

    const missingParticipants = fallbackParticipantCodes
        .filter((code) => !uniqueCodes.has(code))
        .map((code) => participantsByCode[code])
        .filter(Boolean);

    return {
        source: [...source, ...missingParticipants],
        tiers: tierEntries,
    };
}

export function hasStoredVoteBoardState(storageKey) {
    try {
        const rawStoredValue = localStorage.getItem(storageKey);

        if (!rawStoredValue) {
            return false;
        }

        const storedValue = JSON.parse(rawStoredValue);

        return Boolean(storedValue && typeof storedValue === 'object');
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

export function getStoredVoteBoardState(
    storageKey,
    fallbackParticipantCodes,
    allParticipants,
    tiers,
) {
    let storedValue = null;

    try {
        const rawStoredValue = localStorage.getItem(storageKey);
        storedValue = rawStoredValue ? JSON.parse(rawStoredValue) : null;
    } catch (error) {
        console.error(error.message);
    }

    if (!storedValue || Array.isArray(storedValue)) {
        return getDefaultVoteBoardState(
            fallbackParticipantCodes,
            allParticipants,
            tiers,
        );
    }

    return sanitizeTierRankingStorage(
        storedValue,
        fallbackParticipantCodes,
        allParticipants,
        tiers,
    );
}

export function getVoteBoardStateFromStoredValue(
    storedValue,
    fallbackParticipantCodes,
    allParticipants,
    tiers,
) {
    if (!storedValue || Array.isArray(storedValue)) {
        return getDefaultVoteBoardState(
            fallbackParticipantCodes,
            allParticipants,
            tiers,
        );
    }

    return sanitizeTierRankingStorage(
        storedValue,
        fallbackParticipantCodes,
        allParticipants,
        tiers,
    );
}

export function serializeVoteBoardState(boardState, tiers) {
    return {
        source: (boardState.source ?? []).map((participant) => participant.code),
        tiers: Object.fromEntries(
            tiers.map((tier) => [
                tier.id,
                (boardState.tiers[tier.id] ?? []).map(
                    (participant) => participant.code,
                ),
            ]),
        ),
    };
}

export function saveVoteBoardState(storageKey, boardState, tiers) {
    saveStoredRankingCodes(
        storageKey,
        serializeVoteBoardState(boardState, tiers),
    );
}

export function areSerializedVoteBoardStatesEqual(
    referenceBoardState,
    currentBoardState,
    tiers,
) {
    if (!referenceBoardState || !currentBoardState) {
        return false;
    }

    const referenceSource = Array.isArray(referenceBoardState.source)
        ? referenceBoardState.source
        : [];
    const currentSource = Array.isArray(currentBoardState.source)
        ? currentBoardState.source
        : [];

    if (
        referenceSource.length !== currentSource.length ||
        referenceSource.some((code, index) => code !== currentSource[index])
    ) {
        return false;
    }

    return tiers.every((tier) => {
        const referenceTier = Array.isArray(referenceBoardState.tiers?.[tier.id])
            ? referenceBoardState.tiers[tier.id]
            : [];
        const currentTier = Array.isArray(currentBoardState.tiers?.[tier.id])
            ? currentBoardState.tiers[tier.id]
            : [];

        return (
            referenceTier.length === currentTier.length &&
            referenceTier.every((code, index) => code === currentTier[index])
        );
    });
}

export function getVoteRankingCodes(boardState, tiers) {
    return [
        ...tiers.flatMap((tier) =>
            (boardState.tiers?.[tier.id] ?? []).map(
                (participant) => participant.code,
            ),
        ),
        ...(boardState.source ?? []).map((participant) => participant.code),
    ];
}

export function getVoteRankedParticipants(boardState, tiers) {
    return tiers.flatMap((tier) => boardState.tiers[tier.id] ?? []);
}

export function getVoteSaveStatus({
    databaseRankingCodes,
    databaseBoardState,
    currentBoardState,
    tiers,
}) {
    const currentRankingCodes = getVoteRankingCodes(currentBoardState, tiers);
    const rankingSaveStatus = getRankingSaveStatus({
        databaseRankingCodes,
        currentRankingCodes,
    });

    if (
        rankingSaveStatus === 'empty' ||
        !databaseBoardState
    ) {
        return rankingSaveStatus;
    }

    return areSerializedVoteBoardStatesEqual(
        databaseBoardState,
        serializeVoteBoardState(currentBoardState, tiers),
        tiers,
    )
        ? rankingSaveStatus
        : 'dirty';
}
