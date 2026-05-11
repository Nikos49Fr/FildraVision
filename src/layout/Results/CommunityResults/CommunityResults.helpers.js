import {
    allParticipants,
    finalParticipants,
    semiFinal1Participants,
    semiFinal2Participants,
} from '../../../datas/countries';
import {
    USER_RANKING_SESSIONS,
    getRankingCodes,
    getRankingFromCodes,
} from '../../../utils/helpers/rankingsPersistence';

export const COMMUNITY_RESULT_STATUSES = {
    idle: 'idle',
    revealing: 'revealing',
    published: 'published',
};

export const COMMUNITY_REPLAY_PHASES = {
    intro: 'intro',
    voterStart: 'voter-start',
    questionEntry: 'question-entry',
    awardPoints: 'award-points',
    reorderRanking: 'reorder-ranking',
    outro: 'outro',
};

export const EUROVISION_POINTS_BY_POSITION = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
export const COMMUNITY_REPLAY_INTERVAL_MS = 2000;
export const COMMUNITY_REPLAY_ANIMATION_DURATIONS = {
    voterIntroMs: 1200,
    revealQuestionHoldMs: 2000,
    revealQuestionFadeMs: 300,
    revealCountryOpacityMs: 300,
    revealCountryScaleMs: 1000,
    revealPointsAppearMs: 300,
    pointsTransferStartDelayMs: 300,
    pointsTransferMs: 600,
    pointsCountStartDelayMs: 300,
    pointsIncrementMs: 100,
    pointsFadeOutMs: 400,
    rankingReorderMs: 1600,
    voterBreakMs: 5000,
};

export const COMMUNITY_REPLAY_PROGRESS_STORAGE_KEY_PREFIX =
    'community-replay-progress';

export const RESULTS_SESSION_CONFIGS = {
    [USER_RANKING_SESSIONS.semiFinal1UserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.semiFinal1UserRanking,
        title: 'Demi-Finale 1',
        participantCodes: semiFinal1Participants,
    },
    [USER_RANKING_SESSIONS.semiFinal2UserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.semiFinal2UserRanking,
        title: 'Demi-Finale 2',
        participantCodes: semiFinal2Participants,
    },
    [USER_RANKING_SESSIONS.finalUserRanking]: {
        sessionKey: USER_RANKING_SESSIONS.finalUserRanking,
        title: 'Grande Finale',
        participantCodes: finalParticipants,
    },
};

export const DEFAULT_RESULTS_SESSION_KEY =
    USER_RANKING_SESSIONS.semiFinal1UserRanking;

function getParticipantsByCode(participants) {
    return participants.reduce((acc, participant) => {
        acc[participant.code] = participant;
        return acc;
    }, {});
}

function getParticipantOrderMap(participantCodes) {
    return new Map(
        participantCodes.map((participantCode, index) => [participantCode, index]),
    );
}

function createCommunityRankingEntry(participant, positionCountLength) {
    return {
        code: participant.code,
        participant,
        totalPoints: 0,
        positionCounts: Array(positionCountLength).fill(0),
        position: 0,
    };
}

function cloneCommunityRankingEntry(entry) {
    return {
        ...entry,
        positionCounts: [...entry.positionCounts],
    };
}

function sortCommunityRankingEntries(entries, participantOrderMap) {
    return [...entries]
        .sort((entryA, entryB) => {
            if (entryB.totalPoints !== entryA.totalPoints) {
                return entryB.totalPoints - entryA.totalPoints;
            }

            const maxPositionCountLength = Math.max(
                entryA.positionCounts.length,
                entryB.positionCounts.length,
            );

            for (
                let positionIndex = 0;
                positionIndex < maxPositionCountLength;
                positionIndex += 1
            ) {
                const positionCountDifference =
                    (entryB.positionCounts[positionIndex] ?? 0) -
                    (entryA.positionCounts[positionIndex] ?? 0);

                if (positionCountDifference !== 0) {
                    return positionCountDifference;
                }
            }

            return (
                (participantOrderMap.get(entryA.code) ?? Number.MAX_SAFE_INTEGER) -
                (participantOrderMap.get(entryB.code) ?? Number.MAX_SAFE_INTEGER)
            );
        })
        .map((entry, index) => ({
            ...entry,
            position: index + 1,
        }));
}

function createCommunityRankingEntries(
    participantCodes,
    participantsByCode,
    participantOrderMap,
) {
    const entries = participantCodes
        .map((participantCode) => participantsByCode[participantCode])
        .filter(Boolean)
        .map((participant) =>
            createCommunityRankingEntry(participant, participantCodes.length),
        );

    return sortCommunityRankingEntries(entries, participantOrderMap);
}

function applyCommunityVotePoints(
    currentEntries,
    rankingCodes,
    rankingPositionIndex,
) {
    const awardedParticipantCode = rankingCodes[rankingPositionIndex];

    if (!awardedParticipantCode) {
        return currentEntries;
    }

    const awardedPoints =
        EUROVISION_POINTS_BY_POSITION[rankingPositionIndex] ?? 0;
    const nextEntries = currentEntries.map((entry) => {
        if (entry.code !== awardedParticipantCode) {
            return cloneCommunityRankingEntry(entry);
        }

        const nextEntry = cloneCommunityRankingEntry(entry);
        nextEntry.totalPoints += awardedPoints;
        nextEntry.positionCounts[rankingPositionIndex] += 1;

        return nextEntry;
    });

    return nextEntries;
}

function applyCommunityNonScoringTieBreaks(
    currentEntries,
    voters,
    participantOrderMap,
) {
    const nextEntries = currentEntries.map(cloneCommunityRankingEntry);

    voters.forEach((voter) => {
        voter.rankingCodes.forEach((participantCode, rankingPositionIndex) => {
            if (rankingPositionIndex < EUROVISION_POINTS_BY_POSITION.length) {
                return;
            }

            const entry = nextEntries.find(
                (rankingEntry) => rankingEntry.code === participantCode,
            );

            if (!entry) {
                return;
            }

            entry.positionCounts[rankingPositionIndex] += 1;
        });
    });

    return sortCommunityRankingEntries(nextEntries, participantOrderMap);
}

function getTopTenRankingEntries(voter) {
    return voter.ranking.slice(0, EUROVISION_POINTS_BY_POSITION.length);
}

function createCommunityReplayStep({
    currentRanking,
    voter = null,
    voterIndex = -1,
    voterCount = 0,
    revealCount = 0,
    phase,
    voterStartStepIndex = null,
}) {
    const topTenRanking = voter ? getTopTenRankingEntries(voter) : [];
    const revealedRanking = topTenRanking.slice(topTenRanking.length - revealCount);
    const latestRevealedRanking =
        revealCount > 0 ? revealedRanking[0] : null;
    const rankingPosition =
        revealCount > 0 ? topTenRanking.length - revealCount + 1 : null;

    return {
        voterIndex,
        voterCount,
        revealCount,
        phase,
        voterStartStepIndex,
        voter,
        revealedRanking,
        latestAward:
            latestRevealedRanking && rankingPosition != null
                ? {
                      participant: latestRevealedRanking,
                      participantCode: latestRevealedRanking.code,
                      rankingPosition,
                      points:
                          EUROVISION_POINTS_BY_POSITION[rankingPosition - 1] ?? 0,
                  }
                : null,
        communityRanking: currentRanking.map(cloneCommunityRankingEntry),
    };
}

export function getResultsSessionConfig(sessionKey) {
    return (
        RESULTS_SESSION_CONFIGS[sessionKey] ??
        RESULTS_SESSION_CONFIGS[DEFAULT_RESULTS_SESSION_KEY]
    );
}

export function getCommunityRankingVoters(
    userRankings,
    participantCodes,
    participants = allParticipants,
) {
    const participantsByCode = getParticipantsByCode(participants);

    return [...userRankings]
        .filter((userRanking) => Array.isArray(userRanking?.rankingCodes))
        .map((userRanking) => {
            const normalizedRanking = getRankingFromCodes(
                userRanking.rankingCodes,
                participantCodes,
                participants,
            );

            return {
                userId: userRanking.userId,
                createdAt: userRanking.createdAt ?? null,
                displayName: userRanking.displayName || 'Anonyme',
                avatarUrl: userRanking.avatarUrl ?? null,
                ranking: normalizedRanking,
                rankingCodes: getRankingCodes(normalizedRanking),
                topTenCodes: getRankingCodes(
                    normalizedRanking.slice(0, EUROVISION_POINTS_BY_POSITION.length),
                ),
                topTenRanking: normalizedRanking.slice(
                    0,
                    EUROVISION_POINTS_BY_POSITION.length,
                ),
                participantByCode: participantsByCode,
            };
        })
        .sort((voterA, voterB) => {
            const voterADate = voterA.createdAt ? Date.parse(voterA.createdAt) : 0;
            const voterBDate = voterB.createdAt ? Date.parse(voterB.createdAt) : 0;

            return voterADate - voterBDate;
        });
}

export function buildCommunityRankingReplay(
    userRankings,
    participantCodes,
    participants = allParticipants,
) {
    const participantsByCode = getParticipantsByCode(participants);
    const participantOrderMap = getParticipantOrderMap(participantCodes);
    const voters = getCommunityRankingVoters(
        userRankings,
        participantCodes,
        participants,
    );
    const initialRanking = createCommunityRankingEntries(
        participantCodes,
        participantsByCode,
        participantOrderMap,
    );
    const minimumVoterCountReached = voters.length >= 2;

    if (!minimumVoterCountReached) {
        return {
            voters,
            timeline: [],
            initialRanking,
            finalRanking: initialRanking,
            voterCount: voters.length,
            minimumVoterCountReached,
        };
    }

    const timeline = [
        createCommunityReplayStep({
            currentRanking: initialRanking,
            voterCount: voters.length,
            phase: COMMUNITY_REPLAY_PHASES.intro,
        }),
    ];
    let currentRanking = initialRanking;

    voters.forEach((voter, voterIndex) => {
        const voterStartStepIndex = timeline.length;

        timeline.push(
            createCommunityReplayStep({
                currentRanking,
                voter,
                voterIndex,
                voterCount: voters.length,
                revealCount: 0,
                phase: COMMUNITY_REPLAY_PHASES.voterStart,
                voterStartStepIndex,
            }),
        );

        const topTenCount = Math.min(
            voter.rankingCodes.length,
            EUROVISION_POINTS_BY_POSITION.length,
        );

        for (let revealCount = 1; revealCount <= topTenCount; revealCount += 1) {
            const rankingPositionIndex = topTenCount - revealCount;
            const rankingWithAddedPoints = applyCommunityVotePoints(
                currentRanking,
                voter.rankingCodes,
                rankingPositionIndex,
            );
            const reorderedRanking = sortCommunityRankingEntries(
                rankingWithAddedPoints,
                participantOrderMap,
            );

            timeline.push(
                createCommunityReplayStep({
                    currentRanking,
                    voter,
                    voterIndex,
                    voterCount: voters.length,
                    revealCount,
                    phase: COMMUNITY_REPLAY_PHASES.questionEntry,
                    voterStartStepIndex,
                }),
            );

            timeline.push(
                createCommunityReplayStep({
                    currentRanking: rankingWithAddedPoints,
                    voter,
                    voterIndex,
                    voterCount: voters.length,
                    revealCount,
                    phase: COMMUNITY_REPLAY_PHASES.awardPoints,
                    voterStartStepIndex,
                }),
            );

            timeline.push(
                createCommunityReplayStep({
                    currentRanking: reorderedRanking,
                    voter,
                    voterIndex,
                    voterCount: voters.length,
                    revealCount,
                    phase: COMMUNITY_REPLAY_PHASES.reorderRanking,
                    voterStartStepIndex,
                }),
            );

            currentRanking = reorderedRanking;
        }
    });

    const finalRanking = applyCommunityNonScoringTieBreaks(
        timeline.at(-1)?.communityRanking ?? initialRanking,
        voters,
        participantOrderMap,
    );

    timeline.push(
        createCommunityReplayStep({
            currentRanking: finalRanking,
            voterCount: voters.length,
            phase: COMMUNITY_REPLAY_PHASES.outro,
        }),
    );

    return {
        voters,
        timeline,
        initialRanking,
        finalRanking,
        voterCount: voters.length,
        minimumVoterCountReached,
    };
}

export function serializeCommunityRankingSnapshot({
    sessionKey,
    voterCount,
    ranking,
}) {
    return {
        sessionKey,
        voterCount,
        ranking: ranking.map((entry) => ({
            code: entry.code,
            totalPoints: entry.totalPoints,
            positionCounts: [...entry.positionCounts],
            position: entry.position,
        })),
    };
}

export function getCommunityRankingFromSnapshot(
    snapshot,
    participantCodes,
    participants = allParticipants,
) {
    const sessionParticipants = getResultsSessionConfig(
        snapshot?.sessionKey,
    ).participantCodes;
    const participantsByCode = getParticipantsByCode(participants);
    const participantOrderMap = getParticipantOrderMap(
        participantCodes ?? sessionParticipants,
    );

    if (!Array.isArray(snapshot?.ranking)) {
        return createCommunityRankingEntries(
            participantCodes ?? sessionParticipants,
            participantsByCode,
            participantOrderMap,
        );
    }

    return snapshot.ranking
        .map((entry) => {
            const participant = participantsByCode[entry.code];

            if (!participant) {
                return null;
            }

            return {
                code: entry.code,
                participant,
                totalPoints: entry.totalPoints ?? 0,
                positionCounts: Array.isArray(entry.positionCounts)
                    ? [...entry.positionCounts]
                    : Array((participantCodes ?? sessionParticipants).length).fill(0),
                position: entry.position ?? 0,
            };
        })
        .filter(Boolean)
        .sort((entryA, entryB) => entryA.position - entryB.position);
}

export function formatCommunityPointsLabel(points) {
    return `${points} pt${points > 1 ? 's' : ''}`;
}

export function getCommunityPointsLabelParts(points) {
    return {
        value: String(points),
        suffix: `pt${points > 1 ? 's' : ''}`,
    };
}

export function getQuestionRevealDuration(
    animationDurations = COMMUNITY_REPLAY_ANIMATION_DURATIONS,
) {
    return (
        animationDurations.revealQuestionHoldMs +
        Math.max(
            animationDurations.revealQuestionFadeMs,
            animationDurations.revealCountryOpacityMs,
            animationDurations.revealCountryScaleMs +
                animationDurations.revealPointsAppearMs,
        )
    );
}

export function getTwoColumnRankingItemPlacement(index, itemCount) {
    const rowCount = Math.ceil(itemCount / 2);
    const isLeftColumn = index < rowCount;

    return {
        column: isLeftColumn ? 1 : 2,
        row: isLeftColumn ? index + 1 : index - rowCount + 1,
        rowCount,
    };
}

export function isManualReplayStep(step) {
    return (
        step?.phase === COMMUNITY_REPLAY_PHASES.intro ||
        step?.phase === COMMUNITY_REPLAY_PHASES.reorderRanking ||
        step?.phase === COMMUNITY_REPLAY_PHASES.outro
    );
}

export function findNextManualReplayStepIndex(timeline, currentStepIndex) {
    for (
        let nextStepIndex = currentStepIndex + 1;
        nextStepIndex < timeline.length;
        nextStepIndex += 1
    ) {
        if (isManualReplayStep(timeline[nextStepIndex])) {
            return nextStepIndex;
        }
    }

    return null;
}

export function findPreviousManualReplayStepIndex(timeline, currentStepIndex) {
    for (
        let previousStepIndex = currentStepIndex - 1;
        previousStepIndex >= 0;
        previousStepIndex -= 1
    ) {
        if (isManualReplayStep(timeline[previousStepIndex])) {
            return previousStepIndex;
        }
    }

    return null;
}

export function getReplayStepDelay(
    currentStep,
    nextStep,
    animationDurations = COMMUNITY_REPLAY_ANIMATION_DURATIONS,
) {
    if (!currentStep) {
        return COMMUNITY_REPLAY_INTERVAL_MS;
    }

    if (currentStep.phase === COMMUNITY_REPLAY_PHASES.voterStart) {
        return animationDurations.voterIntroMs;
    }

    if (currentStep.phase === COMMUNITY_REPLAY_PHASES.questionEntry) {
        return getQuestionRevealDuration(animationDurations);
    }

    if (currentStep.phase === COMMUNITY_REPLAY_PHASES.awardPoints) {
        return (
            animationDurations.pointsTransferStartDelayMs +
            animationDurations.pointsTransferMs +
            animationDurations.pointsCountStartDelayMs +
            (currentStep.latestAward?.points ?? 0) *
                animationDurations.pointsIncrementMs +
            animationDurations.pointsFadeOutMs
        );
    }

    if (currentStep.phase === COMMUNITY_REPLAY_PHASES.reorderRanking) {
        if (
            nextStep?.phase === COMMUNITY_REPLAY_PHASES.voterStart &&
            nextStep.voterIndex !== currentStep.voterIndex
        ) {
            return animationDurations.voterBreakMs;
        }

        if (nextStep?.phase === COMMUNITY_REPLAY_PHASES.outro) {
            return animationDurations.voterBreakMs;
        }

        return animationDurations.rankingReorderMs;
    }

    return COMMUNITY_REPLAY_INTERVAL_MS;
}

export function getCommunityReplayProgressStorageKey(sessionKey) {
    return `${COMMUNITY_REPLAY_PROGRESS_STORAGE_KEY_PREFIX}-${sessionKey}`;
}
