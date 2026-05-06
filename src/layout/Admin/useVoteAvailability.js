import { useCallback, useEffect, useState } from 'react';
import {
    getOpenVoteSessionKey,
    setOpenVoteSessionKey,
} from '../../services/voteAvailability';

export default function useVoteAvailability() {
    const [openSessionKey, setOpenSessionKey] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingSessionKey, setPendingSessionKey] = useState(null);

    const loadOpenSessionKey = useCallback(async () => {
        try {
            const nextOpenSessionKey = await getOpenVoteSessionKey();
            setOpenSessionKey(nextOpenSessionKey);
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOpenSessionKey();
    }, [loadOpenSessionKey]);

    async function handleVoteAvailabilityChange(sessionKey, nextChecked) {
        const nextOpenSessionKey = nextChecked ? sessionKey : null;

        setPendingSessionKey(sessionKey);

        try {
            await setOpenVoteSessionKey(nextOpenSessionKey);
            setOpenSessionKey(nextOpenSessionKey);
        } catch (error) {
            console.error(error.message);
        } finally {
            setPendingSessionKey(null);
        }
    }

    function isSessionOpen(sessionKey) {
        return openSessionKey === sessionKey;
    }

    function isSessionPending(sessionKey) {
        return pendingSessionKey === sessionKey;
    }

    return {
        isLoading,
        isSessionOpen,
        isSessionPending,
        handleVoteAvailabilityChange,
    };
}
