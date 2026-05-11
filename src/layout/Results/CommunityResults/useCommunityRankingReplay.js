import { useEffect, useMemo, useRef, useState } from 'react';
import {
    COMMUNITY_REPLAY_ANIMATION_DURATIONS,
    COMMUNITY_REPLAY_INTERVAL_MS,
    COMMUNITY_REPLAY_PHASES,
    findNextManualReplayStepIndex,
    findPreviousManualReplayStepIndex,
    getReplayStepDelay,
} from './CommunityResults.helpers';

export default function useCommunityRankingReplay({
    replay,
    sessionKey,
    initialStatus,
    enabled = false,
    intervalMs = COMMUNITY_REPLAY_INTERVAL_MS,
    animationDurations = COMMUNITY_REPLAY_ANIMATION_DURATIONS,
    onRevealStart,
    onReplayCompleted,
}) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [pauseTargetStepIndex, setPauseTargetStepIndex] = useState(null);
    const [hasRevealStarted, setHasRevealStarted] = useState(
        initialStatus === 'revealing' || initialStatus === 'published',
    );
    const completionHandledRef = useRef(initialStatus === 'published');
    const replayLength = replay.timeline.length;
    const currentStep = replay.timeline[currentStepIndex] ?? null;
    const isCompleted =
        replayLength > 0 && currentStepIndex >= replayLength - 1;
    const nextManualStepIndex = useMemo(
        () => findNextManualReplayStepIndex(replay.timeline, currentStepIndex),
        [currentStepIndex, replay.timeline],
    );
    const previousManualStepIndex = useMemo(
        () =>
            findPreviousManualReplayStepIndex(
                replay.timeline,
                currentStepIndex,
            ),
        [currentStepIndex, replay.timeline],
    );

    useEffect(() => {
        let nextStepIndex = 0;
        const nextHasRevealStarted =
            initialStatus === 'revealing' || initialStatus === 'published';

        if (initialStatus === 'published' && replay.timeline.length > 0) {
            nextStepIndex = replay.timeline.length - 1;
        }

        setCurrentStepIndex(nextStepIndex);
        setIsPlaying(false);
        setIsPending(false);
        setPauseTargetStepIndex(null);
        setHasRevealStarted(nextHasRevealStarted);
        completionHandledRef.current = initialStatus === 'published';
    }, [initialStatus, replay]);

    useEffect(() => {
        if (initialStatus === 'revealing' || initialStatus === 'published') {
            setHasRevealStarted(true);
        }

        if (initialStatus === 'published') {
            completionHandledRef.current = true;
        }
    }, [initialStatus]);

    useEffect(() => {
        if (!enabled || !isPlaying || isPending || replayLength === 0) {
            return undefined;
        }

        if (isCompleted) {
            setIsPlaying(false);
            return undefined;
        }

        const nextStep = replay.timeline[currentStepIndex + 1] ?? null;
        const stepDelay = getReplayStepDelay(
            currentStep,
            nextStep,
            animationDurations,
        );
        const timeoutId = window.setTimeout(() => {
            setCurrentStepIndex((stepIndex) => {
                const nextStepIndex = Math.min(stepIndex + 1, replayLength - 1);

                if (
                    pauseTargetStepIndex != null &&
                    nextStepIndex >= pauseTargetStepIndex
                ) {
                    setIsPlaying(false);
                    setPauseTargetStepIndex(null);
                }

                return nextStepIndex;
            });
        }, stepDelay);

        return () => window.clearTimeout(timeoutId);
    }, [
        animationDurations,
        currentStep,
        currentStepIndex,
        enabled,
        intervalMs,
        isCompleted,
        isPending,
        isPlaying,
        pauseTargetStepIndex,
        replayLength,
        replay.timeline,
    ]);

    useEffect(() => {
        if (
            !enabled ||
            !isCompleted ||
            !hasRevealStarted ||
            completionHandledRef.current
        ) {
            return;
        }

        let isMounted = true;

        async function completeReplay() {
            if (!onReplayCompleted) {
                completionHandledRef.current = true;
                return;
            }

            setIsPending(true);

            try {
                await onReplayCompleted();

                if (!isMounted) {
                    return;
                }

                completionHandledRef.current = true;
            } finally {
                if (isMounted) {
                    setIsPending(false);
                    setIsPlaying(false);
                }
            }
        }

        void completeReplay();

        return () => {
            isMounted = false;
        };
    }, [enabled, hasRevealStarted, isCompleted, onReplayCompleted]);

    async function ensureRevealStarted() {
        if (hasRevealStarted || !onRevealStart) {
            if (!hasRevealStarted) {
                setHasRevealStarted(true);
            }

            return;
        }

        setIsPending(true);

        try {
            await onRevealStart();
            setHasRevealStarted(true);
        } finally {
            setIsPending(false);
        }
    }

    async function togglePlayback() {
        if (!enabled || replayLength === 0 || isPending) {
            return;
        }

        if (isPlaying) {
            if (
                currentStep?.phase === COMMUNITY_REPLAY_PHASES.intro ||
                currentStep?.phase === COMMUNITY_REPLAY_PHASES.reorderRanking ||
                currentStep?.phase === COMMUNITY_REPLAY_PHASES.outro
            ) {
                setIsPlaying(false);
                setPauseTargetStepIndex(null);
                return;
            }

            setPauseTargetStepIndex(
                nextManualStepIndex ?? Math.max(replayLength - 1, 0),
            );
            return;
        }

        await ensureRevealStarted();

        if (
            replay.timeline[currentStepIndex]?.phase ===
            COMMUNITY_REPLAY_PHASES.intro
        ) {
            setCurrentStepIndex((stepIndex) =>
                Math.min(stepIndex + 1, replayLength - 1),
            );
        }

        setIsPlaying(true);
        setPauseTargetStepIndex(null);
    }

    async function goToPreviousReveal() {
        if (!enabled || previousManualStepIndex == null || isPending) {
            return;
        }

        setIsPlaying(false);
        setPauseTargetStepIndex(null);
        setCurrentStepIndex(previousManualStepIndex);
    }

    async function goToNextReveal() {
        if (!enabled || nextManualStepIndex == null || isPending) {
            return;
        }

        await ensureRevealStarted();
        setIsPlaying(false);
        setPauseTargetStepIndex(null);
        setCurrentStepIndex(nextManualStepIndex);
    }

    async function goToReplayStart() {
        if (!enabled || replayLength === 0 || isPending) {
            return;
        }

        setIsPlaying(false);
        setPauseTargetStepIndex(null);
        setCurrentStepIndex(0);
    }

    async function goToReplayEnd() {
        if (!enabled || replayLength === 0 || isPending) {
            return;
        }

        await ensureRevealStarted();
        setIsPlaying(false);
        setPauseTargetStepIndex(null);
        setCurrentStepIndex(replayLength - 1);
    }

    function replayReveal() {
        if (!enabled || replayLength === 0) {
            return;
        }

        setIsPlaying(false);
        setPauseTargetStepIndex(null);
        setCurrentStepIndex(0);
        setHasRevealStarted(true);
        completionHandledRef.current = false;
    }

    return {
        currentStep,
        currentStepIndex,
        hasReplay: replayLength > 0,
        hasRevealStarted,
        isCompleted,
        isPending,
        isPlaying,
        goToNextReveal,
        goToPreviousReveal,
        goToReplayEnd,
        goToReplayStart,
        replayReveal,
        togglePlayback,
    };
}
