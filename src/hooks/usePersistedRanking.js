import { useEffect, useRef, useState } from 'react';
import { RANKING_SAVE_STATUSES } from '../utils/helpers/rankingSaveStatus';
import {
    getStoredRanking,
    getStoredRankingCodes,
    getRankingCodes,
    getRankingFromCodes,
    getRankingSaveStatus,
    saveStoredRanking,
    saveStoredRankingCodes,
} from '../utils/helpers/rankingsPersistence';

const SAVING_STATUS_DURATION = 1000;
const ERROR_STATUS_DURATION = 3000;

function wait(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

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
    const statusTimeoutRef = useRef(null);

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

            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, [
        allParticipants,
        fallbackParticipantCodes,
        loadDatabaseRankingCodes,
        storageKey,
    ]);

    function clearStatusTimeout() {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
    }

    function handleRankingChange(nextRanking) {
        clearStatusTimeout();
        setRanking(nextRanking);
        saveStoredRanking(storageKey, nextRanking);
        setSaveStatusOverride(null);
    }

    async function handleRankingSave() {
        const currentRankingCodes = getRankingCodes(rankingRef.current);
        const savingDelay = wait(SAVING_STATUS_DURATION);

        clearStatusTimeout();
        setSaveStatusOverride(RANKING_SAVE_STATUSES.saving);

        try {
            await saveDatabaseRankingCodes(currentRankingCodes);
            await savingDelay;

            saveStoredRankingCodes(storageKey, currentRankingCodes);
            setDatabaseRankingCodes(currentRankingCodes);
            setSaveStatusOverride(null);
        } catch (error) {
            await savingDelay;
            console.error(error.message);
            setSaveStatusOverride(RANKING_SAVE_STATUSES.error);

            statusTimeoutRef.current = setTimeout(() => {
                setSaveStatusOverride(null);
                statusTimeoutRef.current = null;
            }, ERROR_STATUS_DURATION);
        }
    }

    const saveStatus =
        saveStatusOverride ??
        getRankingSaveStatus({
            databaseRankingCodes,
            currentRankingCodes: getRankingCodes(ranking),
        });

    return {
        ranking,
        handleRankingChange,
        handleRankingSave,
        saveStatus,
    };
}
