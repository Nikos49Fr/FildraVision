import { useCallback, useEffect, useState } from 'react';
import { getOpenVoteSessionKey } from '../../services/voteAvailability';

export default function useOpenVoteSession() {
    const [openSessionKey, setOpenSessionKey] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadOpenVoteSessionKey = useCallback(async () => {
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
        void loadOpenVoteSessionKey();
    }, [loadOpenVoteSessionKey]);

    return {
        openSessionKey,
        isLoading,
        reloadOpenVoteSessionKey: loadOpenVoteSessionKey,
    };
}
