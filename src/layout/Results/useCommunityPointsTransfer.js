import { useEffect, useMemo, useRef, useState } from 'react';
import {
    COMMUNITY_REPLAY_ANIMATION_DURATIONS,
    COMMUNITY_REPLAY_PHASES,
} from './Results.helpers';

function getElementCenterPosition(elementRect, containerRect) {
    return {
        x:
            elementRect.left -
            containerRect.left +
            elementRect.width / 2,
        y:
            elementRect.top -
            containerRect.top +
            elementRect.height / 2,
    };
}

export default function useCommunityPointsTransfer({
    currentStep,
    workspaceRef,
    animationDurations = COMMUNITY_REPLAY_ANIMATION_DURATIONS,
}) {
    const sourceRefs = useRef(new Map());
    const targetRefs = useRef(new Map());
    const transferTimerRefs = useRef([]);
    const [activeTransfer, setActiveTransfer] = useState(null);

    function clearTransferTimers() {
        transferTimerRefs.current.forEach((timerId) => {
            window.clearTimeout(timerId);
            window.clearInterval(timerId);
        });
        transferTimerRefs.current = [];
    }

    useEffect(() => () => clearTransferTimers(), []);

    const transferKey = useMemo(() => {
        if (
            currentStep?.phase !== COMMUNITY_REPLAY_PHASES.awardPoints ||
            !currentStep.latestAward
        ) {
            return null;
        }

        return `${currentStep.voterIndex}-${currentStep.revealCount}-${currentStep.latestAward.participantCode}`;
    }, [currentStep]);

    useEffect(() => {
        if (!transferKey || !workspaceRef.current || !currentStep?.latestAward) {
            clearTransferTimers();
            setActiveTransfer(null);
            return;
        }

        const participantCode = currentStep.latestAward.participantCode;
        const sourceElement = sourceRefs.current.get(participantCode);
        const targetElement = targetRefs.current.get(participantCode);

        if (!sourceElement || !targetElement) {
            return;
        }

        clearTransferTimers();

        const workspaceRect = workspaceRef.current.getBoundingClientRect();
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const sourcePosition = getElementCenterPosition(sourceRect, workspaceRect);
        const targetPosition = getElementCenterPosition(targetRect, workspaceRect);
        const points = currentStep.latestAward.points;

        setActiveTransfer({
            key: transferKey,
            participantCode,
            phase: 'pre-travel',
            points,
            remainingPoints: points,
            awardedPoints: 0,
            sourcePosition,
            targetPosition,
        });

        const travelStartTimerId = window.setTimeout(() => {
            setActiveTransfer((currentTransfer) => {
                if (!currentTransfer || currentTransfer.key !== transferKey) {
                    return currentTransfer;
                }

                return {
                    ...currentTransfer,
                    phase: 'travel',
                };
            });

            const travelTimerId = window.setTimeout(() => {
                setActiveTransfer((currentTransfer) => {
                    if (!currentTransfer || currentTransfer.key !== transferKey) {
                        return currentTransfer;
                    }

                    return {
                        ...currentTransfer,
                        phase: 'pre-count',
                    };
                });

                const countStartTimerId = window.setTimeout(() => {
                    setActiveTransfer((currentTransfer) => {
                        if (
                            !currentTransfer ||
                            currentTransfer.key !== transferKey
                        ) {
                            return currentTransfer;
                        }

                        return {
                            ...currentTransfer,
                            phase: 'count',
                        };
                    });

                    const incrementIntervalId = window.setInterval(() => {
                        setActiveTransfer((currentTransfer) => {
                            if (
                                !currentTransfer ||
                                currentTransfer.key !== transferKey
                            ) {
                                return currentTransfer;
                            }

                            const nextRemainingPoints = Math.max(
                                currentTransfer.remainingPoints - 1,
                                0,
                            );
                            const nextAwardedPoints = Math.min(
                                currentTransfer.awardedPoints + 1,
                                points,
                            );

                            if (nextRemainingPoints === 0) {
                                window.clearInterval(incrementIntervalId);

                                const fadeOutTimerId = window.setTimeout(() => {
                                    setActiveTransfer((latestTransfer) => {
                                        if (
                                            !latestTransfer ||
                                            latestTransfer.key !== transferKey
                                        ) {
                                            return latestTransfer;
                                        }

                                        return null;
                                    });
                                }, animationDurations.pointsFadeOutMs);

                                transferTimerRefs.current.push(fadeOutTimerId);

                                return {
                                    ...currentTransfer,
                                    phase: 'fade-out',
                                    remainingPoints: nextRemainingPoints,
                                    awardedPoints: nextAwardedPoints,
                                };
                            }

                            return {
                                ...currentTransfer,
                                remainingPoints: nextRemainingPoints,
                                awardedPoints: nextAwardedPoints,
                            };
                        });
                    }, animationDurations.pointsIncrementMs);

                    transferTimerRefs.current.push(incrementIntervalId);
                }, animationDurations.pointsCountStartDelayMs);

                transferTimerRefs.current.push(countStartTimerId);
            }, animationDurations.pointsTransferMs);

            transferTimerRefs.current.push(travelTimerId);
        }, animationDurations.pointsTransferStartDelayMs);

        transferTimerRefs.current.push(travelStartTimerId);

        return () => {
            clearTransferTimers();
        };
    }, [animationDurations, currentStep, transferKey, workspaceRef]);

    function registerSourceRef(participantCode) {
        return (node) => {
            if (node) {
                sourceRefs.current.set(participantCode, node);
                return;
            }

            sourceRefs.current.delete(participantCode);
        };
    }

    function registerTargetRef(participantCode) {
        return (node) => {
            if (node) {
                targetRefs.current.set(participantCode, node);
                return;
            }

            targetRefs.current.delete(participantCode);
        };
    }

    return {
        activeTransfer,
        registerSourceRef,
        registerTargetRef,
    };
}
