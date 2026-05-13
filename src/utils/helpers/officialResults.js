import { OFFICIAL_RANKING_SESSIONS } from './rankingsPersistence';

export const OFFICIAL_RESULT_TYPES = {
    ranking: 'ranking',
    qualification: 'qualification',
};

export const OFFICIAL_QUALIFIED_PARTICIPANT_COUNT = 10;
export const OFFICIAL_NON_QUALIFIED_TIER_ID = 'non_qualified';

const OFFICIAL_RESULT_TYPE_BY_SESSION = {
    [OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking]:
        OFFICIAL_RESULT_TYPES.qualification,
    [OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking]:
        OFFICIAL_RESULT_TYPES.qualification,
    [OFFICIAL_RANKING_SESSIONS.finalOfficialRanking]:
        OFFICIAL_RESULT_TYPES.ranking,
};

function sanitizeOfficialRankingCodes(rankingCodes, fallbackParticipantCodes) {
    if (!Array.isArray(fallbackParticipantCodes)) {
        return [];
    }

    const fallbackSet = new Set(fallbackParticipantCodes);
    const uniqueRankingCodes = Array.isArray(rankingCodes)
        ? rankingCodes.filter(
              (code, index) =>
                  typeof code === 'string' &&
                  fallbackSet.has(code) &&
                  rankingCodes.indexOf(code) === index,
          )
        : [];

    const missingCodes = fallbackParticipantCodes.filter(
        (code) => !uniqueRankingCodes.includes(code),
    );

    return [...uniqueRankingCodes, ...missingCodes];
}

export function getOfficialResultType(sessionKey) {
    return (
        OFFICIAL_RESULT_TYPE_BY_SESSION[sessionKey] ??
        OFFICIAL_RESULT_TYPES.ranking
    );
}

export function isOfficialQualificationSession(sessionKey) {
    return getOfficialResultType(sessionKey) === OFFICIAL_RESULT_TYPES.qualification;
}

export function getOfficialQualificationBoardStateFromRankingCodes(
    rankingCodes,
    fallbackParticipantCodes,
    {
        qualifiedCount = OFFICIAL_QUALIFIED_PARTICIPANT_COUNT,
        preferAllNonQualified = false,
    } = {},
) {
    const safeRankingCodes = sanitizeOfficialRankingCodes(
        rankingCodes,
        fallbackParticipantCodes,
    );

    if (preferAllNonQualified) {
        return {
            source: [],
            tiers: {
                [OFFICIAL_NON_QUALIFIED_TIER_ID]: safeRankingCodes,
            },
        };
    }

    return {
        source: safeRankingCodes.slice(0, qualifiedCount),
        tiers: {
            [OFFICIAL_NON_QUALIFIED_TIER_ID]: safeRankingCodes.slice(qualifiedCount),
        },
    };
}

export function flattenOfficialQualificationBoardState(boardState) {
    if (!boardState || typeof boardState !== 'object') {
        return [];
    }

    const qualifiedCodes = Array.isArray(boardState.source)
        ? boardState.source
        : [];
    const nonQualifiedCodes = Array.isArray(
        boardState.tiers?.[OFFICIAL_NON_QUALIFIED_TIER_ID],
    )
        ? boardState.tiers[OFFICIAL_NON_QUALIFIED_TIER_ID]
        : [];

    return [...qualifiedCodes, ...nonQualifiedCodes];
}

export function isOfficialQualificationBoardStateComplete(
    boardState,
    fallbackParticipantCodes,
    { qualifiedCount = OFFICIAL_QUALIFIED_PARTICIPANT_COUNT } = {},
) {
    const safeParticipantCodes = Array.isArray(fallbackParticipantCodes)
        ? fallbackParticipantCodes
        : [];
    const flattenedCodes = flattenOfficialQualificationBoardState(boardState);

    return (
        flattenedCodes.length === safeParticipantCodes.length &&
        Array.isArray(boardState?.source) &&
        boardState.source.length === qualifiedCount
    );
}

export function areOfficialQualificationBoardStatesEqual(
    referenceBoardState,
    currentBoardState,
) {
    const referenceQualifiedCodes = Array.isArray(referenceBoardState?.source)
        ? referenceBoardState.source
        : [];
    const currentQualifiedCodes = Array.isArray(currentBoardState?.source)
        ? currentBoardState.source
        : [];
    const referenceNonQualifiedCodes = Array.isArray(
        referenceBoardState?.tiers?.[OFFICIAL_NON_QUALIFIED_TIER_ID],
    )
        ? referenceBoardState.tiers[OFFICIAL_NON_QUALIFIED_TIER_ID]
        : [];
    const currentNonQualifiedCodes = Array.isArray(
        currentBoardState?.tiers?.[OFFICIAL_NON_QUALIFIED_TIER_ID],
    )
        ? currentBoardState.tiers[OFFICIAL_NON_QUALIFIED_TIER_ID]
        : [];

    if (referenceQualifiedCodes.length !== currentQualifiedCodes.length) {
        return false;
    }

    if (referenceNonQualifiedCodes.length !== currentNonQualifiedCodes.length) {
        return false;
    }

    return (
        referenceQualifiedCodes.every(
            (code, index) => code === currentQualifiedCodes[index],
        ) &&
        referenceNonQualifiedCodes.every(
            (code, index) => code === currentNonQualifiedCodes[index],
        )
    );
}

export function getQualifiedParticipantCodesFromOfficialRankingCodes(
    rankingCodes,
    {
        qualifiedCount = OFFICIAL_QUALIFIED_PARTICIPANT_COUNT,
    } = {},
) {
    if (!Array.isArray(rankingCodes)) {
        return [];
    }

    return rankingCodes.slice(0, qualifiedCount).filter(Boolean);
}
