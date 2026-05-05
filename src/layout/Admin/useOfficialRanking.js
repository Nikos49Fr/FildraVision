import { useCallback } from 'react';
import usePersistedRanking from '../../hooks/usePersistedRanking';
import {
    getOfficialRankingCodes,
    saveOfficialRankingCodes,
} from '../../services/officialRankings';

export default function useOfficialRanking({
    storageKey,
    sessionKey,
    fallbackParticipantCodes,
    allParticipants,
}) {
    const loadDatabaseRankingCodes = useCallback(
        () => getOfficialRankingCodes(sessionKey),
        [sessionKey],
    );
    const saveDatabaseRankingCodes = useCallback(
        (rankingCodes) => saveOfficialRankingCodes(sessionKey, rankingCodes),
        [sessionKey],
    );

    return usePersistedRanking({
        storageKey,
        fallbackParticipantCodes,
        allParticipants,
        loadDatabaseRankingCodes,
        saveDatabaseRankingCodes,
    });
}
