import { useEffect, useRef, useState } from 'react';
import { RANKING_SAVE_STATUSES } from '../../components/RankingSaveButton/RankingSaveButton';
import {
    getStoredRanking,
    getRankingCodes,
    getRankingFromCodes,
    getRankingSaveStatus,
    saveStoredRanking,
    saveStoredRankingCodes,
    OFFICIAL_RANKING_LOCAL_STORAGE_KEYS,
    OFFICIAL_RANKING_SESSIONS,
} from '../../utils/helpers/rankingsPersistence';
import {
    getOfficialRankingCodes,
    saveOfficialRankingCodes,
} from '../../services/officialRankings';
import {
    allParticipants,
    semiFinal1Participants,
    semiFinal2Participants,
    finalParticipants,
} from '../../datas/countries';

function getInitialDatabaseRankingCodes() {
    return {
        semiFinal1OfficialRanking: null,
        semiFinal2OfficialRanking: null,
        finalOfficialRanking: null,
    };
}

function getInitialSaveStatusOverrides() {
    return {
        semiFinal1OfficialRanking: null,
        semiFinal2OfficialRanking: null,
        finalOfficialRanking: null,
    };
}

function getInitialOfficialRankings() {
    return {
        semiFinal1OfficialRanking: getStoredRanking(
            OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.semiFinal1OfficialRanking,
            semiFinal1Participants,
            allParticipants,
        ),
        semiFinal2OfficialRanking: getStoredRanking(
            OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.semiFinal2OfficialRanking,
            semiFinal2Participants,
            allParticipants,
        ),
        finalOfficialRanking: getStoredRanking(
            OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.finalOfficialRanking,
            finalParticipants,
            allParticipants,
        ),
    };
}

export default function useOfficialRankings() {
    const [officialRankings, setOfficialRankings] = useState(
        getInitialOfficialRankings,
    );
    const [databaseOfficialRankingCodes, setDatabaseOfficialRankingCodes] =
        useState(getInitialDatabaseRankingCodes);
    const [saveStatusOverrides, setSaveStatusOverrides] = useState(
        getInitialSaveStatusOverrides,
    );
    const officialRankingsRef = useRef(officialRankings);
    const errorTimeoutsRef = useRef({});

    useEffect(() => {
        officialRankingsRef.current = officialRankings;
    }, [officialRankings]);

    useEffect(() => {
        let isMounted = true;

        async function loadOfficialRankings() {
            const nextDatabaseRankingCodes = {};
            const nextOfficialRankings = {};

            try {
                const semiFinal1RankingCodes = await getOfficialRankingCodes(
                    OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                );

                nextDatabaseRankingCodes.semiFinal1OfficialRanking =
                    semiFinal1RankingCodes;

                if (semiFinal1RankingCodes) {
                    nextOfficialRankings.semiFinal1OfficialRanking =
                        getRankingFromCodes(
                            semiFinal1RankingCodes,
                            semiFinal1Participants,
                            allParticipants,
                        );
                    saveStoredRankingCodes(
                        OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.semiFinal1OfficialRanking,
                        semiFinal1RankingCodes,
                    );
                }
            } catch (error) {
                console.error(error.message);
            }

            try {
                const semiFinal2RankingCodes = await getOfficialRankingCodes(
                    OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                );

                nextDatabaseRankingCodes.semiFinal2OfficialRanking =
                    semiFinal2RankingCodes;

                if (semiFinal2RankingCodes) {
                    nextOfficialRankings.semiFinal2OfficialRanking =
                        getRankingFromCodes(
                            semiFinal2RankingCodes,
                            semiFinal2Participants,
                            allParticipants,
                        );
                    saveStoredRankingCodes(
                        OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.semiFinal2OfficialRanking,
                        semiFinal2RankingCodes,
                    );
                }
            } catch (error) {
                console.error(error.message);
            }

            try {
                const finalRankingCodes = await getOfficialRankingCodes(
                    OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                );

                nextDatabaseRankingCodes.finalOfficialRanking = finalRankingCodes;

                if (finalRankingCodes) {
                    nextOfficialRankings.finalOfficialRanking =
                        getRankingFromCodes(
                            finalRankingCodes,
                            finalParticipants,
                            allParticipants,
                        );
                    saveStoredRankingCodes(
                        OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.finalOfficialRanking,
                        finalRankingCodes,
                    );
                }
            } catch (error) {
                console.error(error.message);
            }

            if (!isMounted) {
                return;
            }

            setDatabaseOfficialRankingCodes((currentDatabaseRankingCodes) => ({
                ...currentDatabaseRankingCodes,
                ...nextDatabaseRankingCodes,
            }));

            if (Object.keys(nextOfficialRankings).length > 0) {
                setOfficialRankings((currentOfficialRankings) => ({
                    ...currentOfficialRankings,
                    ...nextOfficialRankings,
                }));
            }
        }

        loadOfficialRankings();

        return () => {
            isMounted = false;

            Object.values(errorTimeoutsRef.current).forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
        };
    }, []);

    function handleOfficialRankingChange(sectionKey, storageKey, nextRanking) {
        if (errorTimeoutsRef.current[sectionKey]) {
            clearTimeout(errorTimeoutsRef.current[sectionKey]);
            errorTimeoutsRef.current[sectionKey] = null;
        }

        setOfficialRankings((currentOfficialRankings) => ({
            ...currentOfficialRankings,
            [sectionKey]: nextRanking,
        }));
        saveStoredRanking(storageKey, nextRanking);
        setSaveStatusOverrides((currentSaveStatusOverrides) => ({
            ...currentSaveStatusOverrides,
            [sectionKey]: null,
        }));
    }

    async function handleOfficialRankingSave(sectionKey, sessionKey, storageKey) {
        const currentRanking = officialRankingsRef.current[sectionKey];
        const currentRankingCodes = getRankingCodes(currentRanking);

        setSaveStatusOverrides((currentSaveStatusOverrides) => ({
            ...currentSaveStatusOverrides,
            [sectionKey]: RANKING_SAVE_STATUSES.saving,
        }));

        try {
            await saveOfficialRankingCodes(sessionKey, currentRankingCodes);

            saveStoredRankingCodes(storageKey, currentRankingCodes);
            setDatabaseOfficialRankingCodes((currentDatabaseRankingCodes) => ({
                ...currentDatabaseRankingCodes,
                [sectionKey]: currentRankingCodes,
            }));
            setSaveStatusOverrides((currentSaveStatusOverrides) => ({
                ...currentSaveStatusOverrides,
                [sectionKey]: null,
            }));
        } catch (error) {
            console.error(error.message);
            setSaveStatusOverrides((currentSaveStatusOverrides) => ({
                ...currentSaveStatusOverrides,
                [sectionKey]: RANKING_SAVE_STATUSES.error,
            }));

            errorTimeoutsRef.current[sectionKey] = setTimeout(() => {
                setSaveStatusOverrides((currentSaveStatusOverrides) => ({
                    ...currentSaveStatusOverrides,
                    [sectionKey]: null,
                }));
                errorTimeoutsRef.current[sectionKey] = null;
            }, 2500);
        }
    }

    function getResolvedSaveStatus(sectionKey) {
        const overrideStatus = saveStatusOverrides[sectionKey];

        if (overrideStatus) {
            return overrideStatus;
        }

        return getRankingSaveStatus({
            databaseRankingCodes: databaseOfficialRankingCodes[sectionKey],
            currentRankingCodes: getRankingCodes(officialRankings[sectionKey]),
        });
    }

    return {
        officialRankings,
        handleOfficialRankingChange,
        handleOfficialRankingSave,
        getResolvedSaveStatus,
        officialRankingLocalStorageKeys:
            OFFICIAL_RANKING_LOCAL_STORAGE_KEYS,
        officialRankingSessions: OFFICIAL_RANKING_SESSIONS,
    };
}
