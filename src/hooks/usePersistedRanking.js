import { useEffect, useRef, useState } from 'react';
import { RANKING_SAVE_STATUSES } from '../components/RankingSaveButton/RankingSaveButton';
import {
    getStoredRanking,
    getStoredRankingCodes,
    getRankingCodes,
    getRankingFromCodes,
    getRankingSaveStatus,
    saveStoredRanking,
    saveStoredRankingCodes,
} from '../utils/helpers/rankingsPersistence';

export default function usePersistedRanking({
    storageKey,
    fallbackParticipantCodes,
    allParticipants,
    loadDatabaseRankingCodes,
    saveDatabaseRankingCodes,
}) {
    const [ranking, setRanking] = useState(() =>
        getStoredRanking(storageKey, fallbackParticipantCodes, allParticipants),
    );
    const [databaseRankingCodes, setDatabaseRankingCodes] = useState(null);
    const [saveStatusOverride, setSaveStatusOverride] = useState(null);
    const rankingRef = useRef(ranking);
    const errorTimeoutRef = useRef(null);

    useEffect(() => {
        rankingRef.current = ranking;
    }, [ranking]);

    useEffect(() => {
        let isMounted = true;

        async function loadRanking() {
            const storedRankingCodes = getStoredRankingCodes(storageKey);

            try {
                const nextDatabaseRankingCodes =
                    await loadDatabaseRankingCodes();

                if (!isMounted) {
                    return;
                }

                setDatabaseRankingCodes(nextDatabaseRankingCodes);

                if (!storedRankingCodes && nextDatabaseRankingCodes) {
                    setRanking(
                        getRankingFromCodes(
                            nextDatabaseRankingCodes,
                            fallbackParticipantCodes,
                            allParticipants,
                        ),
                    );
                    saveStoredRankingCodes(
                        storageKey,
                        nextDatabaseRankingCodes,
                    );
                }
            } catch (error) {
                console.error(error.message);
            }
        }

        loadRanking();

        return () => {
            isMounted = false;

            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, [
        allParticipants,
        fallbackParticipantCodes,
        loadDatabaseRankingCodes,
        storageKey,
    ]);

    function handleRankingChange(nextRanking) {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }

        setRanking(nextRanking);
        saveStoredRanking(storageKey, nextRanking);
        setSaveStatusOverride(null);
    }

    async function handleRankingSave() {
        const currentRankingCodes = getRankingCodes(rankingRef.current);

        setSaveStatusOverride(RANKING_SAVE_STATUSES.saving);

        try {
            await saveDatabaseRankingCodes(currentRankingCodes);

            saveStoredRankingCodes(storageKey, currentRankingCodes);
            setDatabaseRankingCodes(currentRankingCodes);
            setSaveStatusOverride(null);
        } catch (error) {
            console.error(error.message);
            setSaveStatusOverride(RANKING_SAVE_STATUSES.error);

            errorTimeoutRef.current = setTimeout(() => {
                setSaveStatusOverride(null);
                errorTimeoutRef.current = null;
            }, 2500);
        }
    }

    function getResolvedSaveStatus() {
        if (saveStatusOverride) {
            return saveStatusOverride;
        }

        return getRankingSaveStatus({
            databaseRankingCodes,
            currentRankingCodes: getRankingCodes(ranking),
        });
    }

    return {
        ranking,
        handleRankingChange,
        handleRankingSave,
        getResolvedSaveStatus,
    };
}
