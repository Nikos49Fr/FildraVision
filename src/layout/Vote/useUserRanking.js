import { useCallback, useEffect, useRef, useState } from 'react';
import { RANKING_SAVE_STATUSES } from '../../utils/helpers/rankingSaveStatus';
import {
    getUserRankingState,
    saveUserRankingState,
} from '../../services/userRankings';
import {
    getDefaultVoteBoardState,
    getStoredVoteBoardState,
    getVoteSaveStatus,
    getVoteBoardStateFromStoredValue,
    getVoteRankingCodes,
    hasStoredVoteBoardState,
    serializeVoteBoardState,
    saveVoteBoardState,
} from './Vote.helpers';

export default function useUserRanking({
    storageKey,
    sessionKey,
    fallbackParticipantCodes,
    allParticipants,
    tiers,
    enabled = false,
}) {
    const getDefaultBoardState = useCallback(
        () =>
            getDefaultVoteBoardState(
                fallbackParticipantCodes,
                allParticipants,
                tiers,
            ),
        [allParticipants, fallbackParticipantCodes, tiers],
    );
    const [boardState, setBoardState] = useState(() => getDefaultBoardState());
    const [databaseRankingCodes, setDatabaseRankingCodes] = useState(null);
    const [databaseBoardState, setDatabaseBoardState] = useState(null);
    const [saveStatusOverride, setSaveStatusOverride] = useState(null);
    const boardStateRef = useRef(boardState);
    const statusTimeoutRef = useRef(null);

    const loadDatabaseRankingState = useCallback(
        () => getUserRankingState(sessionKey),
        [sessionKey],
    );
    const saveDatabaseRankingState = useCallback(
        (nextBoardState) => saveUserRankingState(sessionKey, nextBoardState),
        [sessionKey],
    );

    useEffect(() => {
        boardStateRef.current = boardState;
    }, [boardState]);

    useEffect(() => {
        let isMounted = true;

        async function loadBoardState() {
            if (!enabled) {
                if (!isMounted) {
                    return;
                }

                const nextDefaultBoardState = getDefaultBoardState();

                setBoardState(nextDefaultBoardState);
                setDatabaseRankingCodes(null);
                setDatabaseBoardState(null);
                setSaveStatusOverride(null);
                return;
            }

            const nextStoredBoardState = getStoredVoteBoardState(
                storageKey,
                fallbackParticipantCodes,
                allParticipants,
                tiers,
            );
            const hasStoredBoardState = hasStoredVoteBoardState(storageKey);

            try {
                const nextDatabaseRankingState = await loadDatabaseRankingState();

                if (!isMounted) {
                    return;
                }

                if (
                    !hasStoredBoardState &&
                    nextDatabaseRankingState?.boardState
                ) {
                    setBoardState(
                        getVoteBoardStateFromStoredValue(
                            nextDatabaseRankingState.boardState,
                            fallbackParticipantCodes,
                            allParticipants,
                            tiers,
                        ),
                    );
                } else {
                    setBoardState(nextStoredBoardState);
                }

                setDatabaseRankingCodes(
                    nextDatabaseRankingState?.rankingCodes ?? null,
                );
                setDatabaseBoardState(
                    nextDatabaseRankingState?.boardState ?? null,
                );
            } catch (error) {
                console.error(error.message);
            }
        }

        loadBoardState();

        return () => {
            isMounted = false;

            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, [
        allParticipants,
        enabled,
        fallbackParticipantCodes,
        getDefaultBoardState,
        loadDatabaseRankingState,
        storageKey,
        tiers,
    ]);

    function clearStatusTimeout() {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
    }

    function handleBoardStateChange(nextBoardState) {
        if (!enabled) {
            return;
        }

        clearStatusTimeout();
        setBoardState(nextBoardState);
        saveVoteBoardState(storageKey, nextBoardState, tiers);
        setSaveStatusOverride(null);
    }

    async function handleBoardStateSave() {
        if (!enabled) {
            return;
        }

        const currentBoardState = boardStateRef.current;
        const currentRankingCodes = getVoteRankingCodes(currentBoardState, tiers);

        clearStatusTimeout();
        setSaveStatusOverride(RANKING_SAVE_STATUSES.saving);

        try {
            const nextDatabaseRankingState = await saveDatabaseRankingState({
                rankingCodes: currentRankingCodes,
                boardState: serializeVoteBoardState(currentBoardState, tiers),
            });

            setDatabaseRankingCodes(
                nextDatabaseRankingState?.rankingCodes ?? currentRankingCodes,
            );
            setDatabaseBoardState(
                nextDatabaseRankingState?.boardState ??
                    serializeVoteBoardState(currentBoardState, tiers),
            );
            setSaveStatusOverride(null);
        } catch (error) {
            console.error(error.message);
            setSaveStatusOverride(RANKING_SAVE_STATUSES.error);

            statusTimeoutRef.current = setTimeout(() => {
                setSaveStatusOverride(null);
                statusTimeoutRef.current = null;
            }, 3000);
        }
    }

    const saveStatus =
        !enabled
            ? RANKING_SAVE_STATUSES.empty
            : saveStatusOverride ??
              getVoteSaveStatus({
                  databaseRankingCodes,
                  databaseBoardState,
                  currentBoardState: boardState,
                  tiers,
              });

    return {
        boardState,
        handleBoardStateChange,
        handleBoardStateSave,
        saveStatus,
    };
}
