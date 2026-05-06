import { useCallback, useEffect, useState } from 'react';
import usePersistedRanking from '../../hooks/usePersistedRanking';
import {
    getOfficialRankingCodes,
    getOfficialRankingPublicationState,
    saveOfficialRankingCodes,
    setOfficialRankingPublished,
} from '../../services/officialRankings';
import { RANKING_SAVE_STATUSES } from '../../utils/helpers/rankingSaveStatus';

export default function useOfficialRanking({
    storageKey,
    sessionKey,
    fallbackParticipantCodes,
    allParticipants,
}) {
    const [isPublished, setIsPublished] = useState(false);
    const [isPublicationLoading, setIsPublicationLoading] = useState(true);
    const [isPublicationPending, setIsPublicationPending] = useState(false);
    const loadDatabaseRankingCodes = useCallback(
        () => getOfficialRankingCodes(sessionKey),
        [sessionKey],
    );
    const saveDatabaseRankingCodes = useCallback(
        (rankingCodes) => saveOfficialRankingCodes(sessionKey, rankingCodes),
        [sessionKey],
    );

    const persistedRanking = usePersistedRanking({
        storageKey,
        fallbackParticipantCodes,
        allParticipants,
        loadDatabaseRankingCodes,
        saveDatabaseRankingCodes,
    });

    const loadPublicationState = useCallback(async () => {
        try {
            const nextPublicationState =
                await getOfficialRankingPublicationState(sessionKey);
            setIsPublished(nextPublicationState);
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsPublicationLoading(false);
        }
    }, [sessionKey]);

    useEffect(() => {
        void loadPublicationState();
    }, [loadPublicationState]);

    async function handlePublicationChange(nextChecked) {
        setIsPublicationPending(true);

        try {
            const nextPublicationState = await setOfficialRankingPublished(
                sessionKey,
                nextChecked,
            );
            setIsPublished(nextPublicationState);
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsPublicationPending(false);
        }
    }

    const isPublicationSwitchDisabled =
        persistedRanking.saveStatus === RANKING_SAVE_STATUSES.empty ||
        isPublicationLoading ||
        isPublicationPending;

    return {
        ...persistedRanking,
        isPublished,
        isPublicationLoading,
        isPublicationPending,
        isPublicationSwitchDisabled,
        handlePublicationChange,
    };
}
