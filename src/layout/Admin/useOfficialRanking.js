import { useCallback, useEffect, useRef, useState } from 'react';
import usePersistedRanking from '../../hooks/usePersistedRanking';
import {
    getOfficialRankingState,
    saveOfficialRankingCodes,
    setOfficialRankingPublished,
} from '../../services/officialRankings';
import {
    areOfficialQualificationBoardStatesEqual,
    flattenOfficialQualificationBoardState,
    getOfficialQualificationBoardStateFromRankingCodes,
    getOfficialResultType,
    isOfficialQualificationBoardStateComplete,
    OFFICIAL_NON_QUALIFIED_TIER_ID,
    OFFICIAL_RESULT_TYPES,
} from '../../utils/helpers/officialResults';
import { RANKING_SAVE_STATUSES } from '../../utils/helpers/rankingSaveStatus';
import {
    getRankingCodes,
    getRankingFromCodes,
} from '../../utils/helpers/rankingsPersistence';

const SAVING_STATUS_DURATION = 1000;
const ERROR_STATUS_DURATION = 3000;

function wait(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

function getBoardStateStorageKey(storageKey) {
    return `${storageKey}:qualification-board-state`;
}

function getStoredQualificationBoardState(storageKey) {
    try {
        const storedValue = localStorage.getItem(storageKey);

        if (!storedValue) {
            return null;
        }

        const parsedValue = JSON.parse(storedValue);

        if (
            !parsedValue ||
            !Array.isArray(parsedValue.source) ||
            !Array.isArray(parsedValue.tiers?.[OFFICIAL_NON_QUALIFIED_TIER_ID])
        ) {
            return null;
        }

        return parsedValue;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

function saveStoredQualificationBoardState(storageKey, boardState) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(boardState));
    } catch (error) {
        console.error(error.message);
    }
}

function clearStoredQualificationBoardState(storageKey) {
    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.error(error.message);
    }
}

function getParticipantsByCode(allParticipants) {
    return new Map(
        (Array.isArray(allParticipants) ? allParticipants : []).map(
            (participant) => [participant.code, participant],
        ),
    );
}

function getRankingFromExactCodes(rankingCodes, allParticipants) {
    if (!Array.isArray(rankingCodes)) {
        return [];
    }

    const participantsByCode = getParticipantsByCode(allParticipants);

    return rankingCodes
        .map((rankingCode) => participantsByCode.get(rankingCode))
        .filter(Boolean);
}

function resolveQualificationBoardStateFromStoredBoardState(
    storedBoardState,
    allParticipants,
) {
    return {
        source: getRankingFromExactCodes(
            storedBoardState?.source ?? [],
            allParticipants,
        ),
        tiers: {
            [OFFICIAL_NON_QUALIFIED_TIER_ID]: getRankingFromExactCodes(
                storedBoardState?.tiers?.[OFFICIAL_NON_QUALIFIED_TIER_ID] ?? [],
                allParticipants,
            ),
        },
    };
}

function getQualificationBoardStateRankingCodes(boardState) {
    return {
        source: getRankingCodes(boardState?.source ?? []),
        tiers: {
            [OFFICIAL_NON_QUALIFIED_TIER_ID]: getRankingCodes(
                boardState?.tiers?.[OFFICIAL_NON_QUALIFIED_TIER_ID] ?? [],
            ),
        },
    };
}

function resolveQualificationBoardStateFromRankingCodes(
    rankingCodes,
    fallbackParticipantCodes,
    allParticipants,
    options,
) {
    const nextBoardState = getOfficialQualificationBoardStateFromRankingCodes(
        rankingCodes,
        fallbackParticipantCodes,
        options,
    );

    return {
        source: getRankingFromExactCodes(nextBoardState.source, allParticipants),
        tiers: {
            [OFFICIAL_NON_QUALIFIED_TIER_ID]: getRankingFromExactCodes(
                nextBoardState.tiers[OFFICIAL_NON_QUALIFIED_TIER_ID],
                allParticipants,
            ),
        },
    };
}

export default function useOfficialRanking({
    storageKey,
    sessionKey,
    fallbackParticipantCodes,
    allParticipants,
}) {
    const officialResultType = getOfficialResultType(sessionKey);
    const isQualificationResult =
        officialResultType === OFFICIAL_RESULT_TYPES.qualification;
    const boardStateStorageKey = getBoardStateStorageKey(storageKey);
    const [isPublished, setIsPublished] = useState(false);
    const [isPublicationLoading, setIsPublicationLoading] = useState(true);
    const [isPublicationPending, setIsPublicationPending] = useState(false);

    const loadDatabaseState = useCallback(
        () => getOfficialRankingState(sessionKey),
        [sessionKey],
    );
    const saveDatabaseRankingCodes = useCallback(
        (rankingCodes) => saveOfficialRankingCodes(sessionKey, rankingCodes),
        [sessionKey],
    );
    const handleDatabaseStateLoaded = useCallback((databaseState) => {
        setIsPublished(databaseState?.isPublished ?? false);
    }, []);
    const handleDatabaseStateLoadFinished = useCallback(() => {
        setIsPublicationLoading(false);
    }, []);

    const persistedRanking = usePersistedRanking({
        storageKey,
        fallbackParticipantCodes,
        allParticipants,
        loadDatabaseState: isQualificationResult
            ? async () => null
            : loadDatabaseState,
        saveDatabaseRankingCodes: isQualificationResult
            ? async () => null
            : saveDatabaseRankingCodes,
        onDatabaseStateLoaded: isQualificationResult
            ? undefined
            : handleDatabaseStateLoaded,
        onDatabaseStateLoadFinished: isQualificationResult
            ? undefined
            : handleDatabaseStateLoadFinished,
    });

    const [qualificationBoardState, setQualificationBoardState] = useState(
        () => {
            if (!isQualificationResult) {
                return null;
            }

            const storedBoardState = getStoredQualificationBoardState(
                boardStateStorageKey,
            );

            if (storedBoardState) {
                return resolveQualificationBoardStateFromStoredBoardState(
                    storedBoardState,
                    allParticipants,
                );
            }

            return resolveQualificationBoardStateFromRankingCodes(
                fallbackParticipantCodes,
                fallbackParticipantCodes,
                allParticipants,
                {
                    preferAllNonQualified: true,
                },
            );
        },
    );
    const [databaseQualificationBoardState, setDatabaseQualificationBoardState] =
        useState(null);
    const [qualificationSaveStatusOverride, setQualificationSaveStatusOverride] =
        useState(null);
    const qualificationBoardStateRef = useRef(qualificationBoardState);
    const qualificationStatusTimeoutRef = useRef(null);

    useEffect(() => {
        qualificationBoardStateRef.current = qualificationBoardState;
    }, [qualificationBoardState]);

    useEffect(() => {
        if (!isQualificationResult) {
            return undefined;
        }

        let isMounted = true;

        async function loadQualificationRanking() {
            const storedBoardState = getStoredQualificationBoardState(
                boardStateStorageKey,
            );

            try {
                const nextDatabaseState = await loadDatabaseState();

                if (!isMounted) {
                    return;
                }

                handleDatabaseStateLoaded(nextDatabaseState);

                const nextDatabaseBoardState = nextDatabaseState?.rankingCodes
                    ? getOfficialQualificationBoardStateFromRankingCodes(
                          nextDatabaseState.rankingCodes,
                          fallbackParticipantCodes,
                      )
                    : null;

                setDatabaseQualificationBoardState(nextDatabaseBoardState);

                if (storedBoardState) {
                    setQualificationBoardState(
                        resolveQualificationBoardStateFromStoredBoardState(
                            storedBoardState,
                            allParticipants,
                        ),
                    );
                    return;
                }

                if (nextDatabaseBoardState) {
                    setQualificationBoardState(
                        resolveQualificationBoardStateFromRankingCodes(
                            nextDatabaseState.rankingCodes,
                            fallbackParticipantCodes,
                            allParticipants,
                        ),
                    );
                    saveStoredQualificationBoardState(
                        boardStateStorageKey,
                        nextDatabaseBoardState,
                    );
                    return;
                }

                const nextDefaultBoardState =
                    resolveQualificationBoardStateFromRankingCodes(
                        fallbackParticipantCodes,
                        fallbackParticipantCodes,
                        allParticipants,
                        {
                            preferAllNonQualified: true,
                        },
                    );

                setQualificationBoardState(nextDefaultBoardState);
                saveStoredQualificationBoardState(
                    boardStateStorageKey,
                    getQualificationBoardStateRankingCodes(nextDefaultBoardState),
                );
            } catch (error) {
                console.error(error.message);
            } finally {
                if (isMounted) {
                    handleDatabaseStateLoadFinished();
                }
            }
        }

        void loadQualificationRanking();

        return () => {
            isMounted = false;

            if (qualificationStatusTimeoutRef.current) {
                clearTimeout(qualificationStatusTimeoutRef.current);
            }
        };
    }, [
        allParticipants,
        boardStateStorageKey,
        fallbackParticipantCodes,
        handleDatabaseStateLoaded,
        handleDatabaseStateLoadFinished,
        isQualificationResult,
        loadDatabaseState,
    ]);

    const getQualificationRankingCodes = useCallback(
        (boardState) =>
            flattenOfficialQualificationBoardState(
                getQualificationBoardStateRankingCodes(boardState),
            ),
        [],
    );

    function clearQualificationStatusTimeout() {
        if (qualificationStatusTimeoutRef.current) {
            clearTimeout(qualificationStatusTimeoutRef.current);
            qualificationStatusTimeoutRef.current = null;
        }
    }

    function handleQualificationBoardStateChange(nextBoardState) {
        clearQualificationStatusTimeout();
        setQualificationBoardState(nextBoardState);
        saveStoredQualificationBoardState(
            boardStateStorageKey,
            getQualificationBoardStateRankingCodes(nextBoardState),
        );
        setQualificationSaveStatusOverride(null);
    }

    async function handleQualificationRankingSave() {
        const currentBoardState = qualificationBoardStateRef.current;
        const currentRankingCodes =
            getQualificationRankingCodes(currentBoardState);
        const savingDelay = wait(SAVING_STATUS_DURATION);

        clearQualificationStatusTimeout();
        setQualificationSaveStatusOverride(RANKING_SAVE_STATUSES.saving);

        try {
            await saveDatabaseRankingCodes(currentRankingCodes);
            await savingDelay;

            saveStoredQualificationBoardState(
                boardStateStorageKey,
                getQualificationBoardStateRankingCodes(currentBoardState),
            );
            setDatabaseQualificationBoardState(
                getQualificationBoardStateRankingCodes(currentBoardState),
            );
            setQualificationSaveStatusOverride(null);
        } catch (error) {
            await savingDelay;
            console.error(error.message);
            setQualificationSaveStatusOverride(RANKING_SAVE_STATUSES.error);

            qualificationStatusTimeoutRef.current = setTimeout(() => {
                setQualificationSaveStatusOverride(null);
                qualificationStatusTimeoutRef.current = null;
            }, ERROR_STATUS_DURATION);
        }
    }

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

    if (isQualificationResult) {
        const qualificationSaveStatus =
            qualificationSaveStatusOverride ??
            (!databaseQualificationBoardState
                ? RANKING_SAVE_STATUSES.empty
                : areOfficialQualificationBoardStatesEqual(
                        databaseQualificationBoardState,
                        getQualificationBoardStateRankingCodes(
                            qualificationBoardState,
                        ),
                    )
                  ? RANKING_SAVE_STATUSES.saved
                  : RANKING_SAVE_STATUSES.dirty);
        const isQualificationResultComplete =
            isOfficialQualificationBoardStateComplete(
                {
                    source: getRankingCodes(qualificationBoardState?.source ?? []),
                    tiers: {
                        [OFFICIAL_NON_QUALIFIED_TIER_ID]: getRankingCodes(
                            qualificationBoardState?.tiers?.[
                                OFFICIAL_NON_QUALIFIED_TIER_ID
                            ] ?? [],
                        ),
                    },
                },
                fallbackParticipantCodes,
            );
        const isPublicationSwitchDisabled = isPublished
            ? isPublicationLoading || isPublicationPending
            : qualificationSaveStatus === RANKING_SAVE_STATUSES.empty ||
              isPublicationLoading ||
              isPublicationPending ||
              !isQualificationResultComplete;

        return {
            ranking: getRankingFromExactCodes(
                getQualificationRankingCodes(qualificationBoardState),
                allParticipants,
            ),
            boardState: qualificationBoardState,
            handleRankingChange: handleQualificationBoardStateChange,
            handleBoardStateChange: handleQualificationBoardStateChange,
            handleRankingSave: handleQualificationRankingSave,
            saveStatus: qualificationSaveStatus,
            isPublished,
            isPublicationLoading,
            isPublicationPending,
            isPublicationSwitchDisabled,
            handlePublicationChange,
            isQualificationResult: true,
            isQualificationResultComplete,
            qualifiedTierId: OFFICIAL_NON_QUALIFIED_TIER_ID,
            resolveBoardStateFromRankingCodes:
                resolveQualificationBoardStateFromRankingCodes,
        };
    }

    const isPublicationSwitchDisabled = isPublished
        ? isPublicationLoading || isPublicationPending
        : persistedRanking.saveStatus === RANKING_SAVE_STATUSES.empty ||
          isPublicationLoading ||
          isPublicationPending;

    return {
        ...persistedRanking,
        boardState: null,
        handleBoardStateChange: null,
        isPublished,
        isPublicationLoading,
        isPublicationPending,
        isPublicationSwitchDisabled,
        handlePublicationChange,
        isQualificationResult: false,
        isQualificationResultComplete: true,
        qualifiedTierId: null,
        resolveBoardStateFromRankingCodes:
            resolveQualificationBoardStateFromRankingCodes,
    };
}
