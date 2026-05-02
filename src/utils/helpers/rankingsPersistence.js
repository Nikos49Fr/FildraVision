const OFFICIAL_RANKING_LOCAL_STORAGE_KEYS = {
    semiFinal1OfficialRanking: 'official-ranking-semi-final-1',
    semiFinal2OfficialRanking: 'official-ranking-semi-final-2',
    finalOfficialRanking: 'official-ranking-final',
};

const OFFICIAL_RANKING_SESSIONS = {
    semiFinal1OfficialRanking: 'semi_final_1',
    semiFinal2OfficialRanking: 'semi_final_2',
    finalOfficialRanking: 'final',
};

function getParticipantsByCode(allParticipants) {
    return allParticipants.reduce((acc, participant) => {
        acc[participant.code] = participant;
        return acc;
    }, {});
}

function sanitizeRankingCodes(rankingCodes, fallbackParticipantCodes) {
    if (!Array.isArray(rankingCodes)) {
        return fallbackParticipantCodes;
    }

    const fallbackSet = new Set(fallbackParticipantCodes);
    const uniqueRankingCodes = rankingCodes.filter(
        (code, index) =>
            typeof code === 'string' &&
            fallbackSet.has(code) &&
            rankingCodes.indexOf(code) === index,
    );

    const missingCodes = fallbackParticipantCodes.filter(
        (code) => !uniqueRankingCodes.includes(code),
    );

    return [...uniqueRankingCodes, ...missingCodes];
}

export function getRankingCodes(ranking) {
    if (!Array.isArray(ranking)) {
        return [];
    }

    return ranking.map((participant) => participant?.code).filter(Boolean);
}

export function areRankingCodesEqual(
    referenceRankingCodes,
    currentRankingCodes,
) {
    if (
        !Array.isArray(referenceRankingCodes) ||
        !Array.isArray(currentRankingCodes) ||
        referenceRankingCodes.length !== currentRankingCodes.length
    ) {
        return false;
    }

    return referenceRankingCodes.every(
        (rankingCode, index) => rankingCode === currentRankingCodes[index],
    );
}

export function getRankingFromCodes(
    rankingCodes,
    fallbackParticipantCodes,
    allParticipants,
) {
    const safeParticipants = Array.isArray(allParticipants)
        ? allParticipants
        : [];
    const participantsByCode = getParticipantsByCode(safeParticipants);
    const resolvedCodes = sanitizeRankingCodes(
        rankingCodes,
        fallbackParticipantCodes,
    );

    return resolvedCodes
        .map((code) => participantsByCode[code])
        .filter(Boolean);
}

export function getStoredRankingCodes(storageKey) {
    try {
        const storedValue = localStorage.getItem(storageKey);

        if (!storedValue) {
            return null;
        }

        const parsedCodes = JSON.parse(storedValue);

        return Array.isArray(parsedCodes) ? parsedCodes : null;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

export function getStoredRanking(
    storageKey,
    fallbackParticipantCodes,
    allParticipants,
) {
    const storedRankingCodes = getStoredRankingCodes(storageKey);

    return getRankingFromCodes(
        storedRankingCodes ?? fallbackParticipantCodes,
        fallbackParticipantCodes,
        allParticipants,
    );
}

export function saveStoredRankingCodes(storageKey, rankingCodes) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(rankingCodes));
    } catch (error) {
        console.error(error.message);
    }
}

export function saveStoredRanking(storageKey, ranking) {
    saveStoredRankingCodes(storageKey, getRankingCodes(ranking));
}

export function getRankingSaveStatus({
    databaseRankingCodes,
    currentRankingCodes,
}) {
    if (
        !Array.isArray(databaseRankingCodes) ||
        databaseRankingCodes.length === 0
    ) {
        return 'empty';
    }

    return areRankingCodesEqual(databaseRankingCodes, currentRankingCodes)
        ? 'saved'
        : 'dirty';
}

export { OFFICIAL_RANKING_LOCAL_STORAGE_KEYS, OFFICIAL_RANKING_SESSIONS };
