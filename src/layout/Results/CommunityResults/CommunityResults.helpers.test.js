import { describe, expect, test } from 'vitest';
import {
    COMMUNITY_REPLAY_PHASES,
    EUROVISION_POINTS_BY_POSITION,
    buildCommunityRankingReplay,
    findNextManualReplayStepIndex,
    findPreviousManualReplayStepIndex,
    getCommunityRankingFromSnapshot,
    getCommunityRankingVoters,
    getQuestionRevealDuration,
    getResultsSessionConfig,
    getTwoColumnRankingItemPlacement,
    isManualReplayStep,
    serializeCommunityRankingSnapshot,
} from './CommunityResults.helpers.js';

function createUserRanking({
    userId,
    createdAt,
    displayName,
    rankingCodes,
}) {
    return {
        userId,
        createdAt,
        displayName,
        rankingCodes,
    };
}

const SEMI_FINAL_1_CODES =
    getResultsSessionConfig('semi_final_1').participantCodes;

describe('Results.helpers', () => {
    test('getCommunityRankingVoters sorts voters by submission time and keeps sanitized rankings', () => {
        const voters = getCommunityRankingVoters(
            [
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: [...SEMI_FINAL_1_CODES].reverse(),
                }),
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: SEMI_FINAL_1_CODES,
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        expect(voters.map((voter) => voter.userId)).toEqual([
            'user-1',
            'user-2',
        ]);
        expect(voters[0].topTenCodes).toEqual(
            SEMI_FINAL_1_CODES.slice(0, EUROVISION_POINTS_BY_POSITION.length),
        );
    });

    test('buildCommunityRankingReplay requires at least two voters', () => {
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: SEMI_FINAL_1_CODES,
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        expect(replay.minimumVoterCountReached).toBe(false);
        expect(replay.timeline).toEqual([]);
    });

    test('buildCommunityRankingReplay adds intro and outro phases around the reveal timeline', () => {
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: SEMI_FINAL_1_CODES,
                }),
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: [...SEMI_FINAL_1_CODES].reverse(),
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        expect(replay.timeline[0].phase).toBe(COMMUNITY_REPLAY_PHASES.intro);
        expect(replay.timeline.at(-1).phase).toBe(COMMUNITY_REPLAY_PHASES.outro);
        expect(replay.timeline.at(-1).communityRanking).toEqual(replay.finalRanking);
    });

    test('buildCommunityRankingReplay starts each voter before the first reveal and reveals the top 10 from 10th to 1st', () => {
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: SEMI_FINAL_1_CODES,
                }),
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: [...SEMI_FINAL_1_CODES].reverse(),
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        expect(replay.minimumVoterCountReached).toBe(true);
        expect(replay.timeline[1].revealCount).toBe(0);
        expect(replay.timeline[1].phase).toBe(COMMUNITY_REPLAY_PHASES.voterStart);
        expect(replay.timeline[1].communityRanking[0].totalPoints).toBe(0);
        expect(replay.timeline[2].phase).toBe(COMMUNITY_REPLAY_PHASES.questionEntry);
        expect(replay.timeline[3].phase).toBe(COMMUNITY_REPLAY_PHASES.awardPoints);
        expect(replay.timeline[4].phase).toBe(COMMUNITY_REPLAY_PHASES.reorderRanking);
        expect(replay.timeline[2].latestAward).toMatchObject({
            participantCode:
                SEMI_FINAL_1_CODES[EUROVISION_POINTS_BY_POSITION.length - 1],
            rankingPosition: 10,
            points: 1,
        });
        expect(
            replay.timeline[5].revealedRanking.map((participant) => participant.code),
        ).toEqual(
            SEMI_FINAL_1_CODES.slice(
                EUROVISION_POINTS_BY_POSITION.length - 2,
                EUROVISION_POINTS_BY_POSITION.length,
            ),
        );
    });

    test('buildCommunityRankingReplay applies the Eurovision point scale and tie-breaks with first places', () => {
        const rankingA = SEMI_FINAL_1_CODES;
        const rankingB = [
            rankingA[1],
            rankingA[0],
            ...rankingA.slice(2),
        ];
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: rankingA,
                }),
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: rankingB,
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        const finalRankingCodes = replay.finalRanking
            .slice(0, 2)
            .map((entry) => entry.code);
        const finalRankingPoints = replay.finalRanking
            .slice(0, 2)
            .map((entry) => entry.totalPoints);

        expect(finalRankingCodes).toEqual([rankingA[0], rankingA[1]]);
        expect(finalRankingPoints).toEqual([22, 22]);
        expect(replay.finalRanking[0].positionCounts[0]).toBe(1);
        expect(replay.finalRanking[1].positionCounts[0]).toBe(1);
        expect(replay.finalRanking[0].positionCounts[1]).toBe(1);
        expect(replay.finalRanking[1].positionCounts[1]).toBe(1);
    });

    test('manual replay steps move from intro to each reordered country then to outro', () => {
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: SEMI_FINAL_1_CODES,
                }),
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: [...SEMI_FINAL_1_CODES].reverse(),
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        expect(isManualReplayStep(replay.timeline[0])).toBe(true);
        expect(findNextManualReplayStepIndex(replay.timeline, 0)).toBe(4);
        expect(findPreviousManualReplayStepIndex(replay.timeline, 4)).toBe(0);
        expect(isManualReplayStep(replay.timeline.at(-1))).toBe(true);
    });

    test('question reveal duration includes hold and reveal timings', () => {
        expect(getQuestionRevealDuration()).toBe(3300);
    });

    test('getTwoColumnRankingItemPlacement fills the first column before the second one', () => {
        expect(getTwoColumnRankingItemPlacement(0, 15)).toEqual({
            column: 1,
            row: 1,
            rowCount: 8,
        });
        expect(getTwoColumnRankingItemPlacement(7, 15)).toEqual({
            column: 1,
            row: 8,
            rowCount: 8,
        });
        expect(getTwoColumnRankingItemPlacement(8, 15)).toEqual({
            column: 2,
            row: 1,
            rowCount: 8,
        });
        expect(getTwoColumnRankingItemPlacement(14, 15)).toEqual({
            column: 2,
            row: 7,
            rowCount: 8,
        });
    });

    test('serializeCommunityRankingSnapshot and getCommunityRankingFromSnapshot preserve the final ordering and points', () => {
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: SEMI_FINAL_1_CODES,
                }),
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: [...SEMI_FINAL_1_CODES].reverse(),
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        const snapshot = serializeCommunityRankingSnapshot({
            sessionKey: 'semi_final_1',
            voterCount: replay.voterCount,
            ranking: replay.finalRanking,
        });
        const restoredRanking = getCommunityRankingFromSnapshot(
            snapshot,
            SEMI_FINAL_1_CODES,
        );

        expect(restoredRanking.map((entry) => entry.code)).toEqual(
            replay.finalRanking.map((entry) => entry.code),
        );
        expect(restoredRanking.map((entry) => entry.totalPoints)).toEqual(
            replay.finalRanking.map((entry) => entry.totalPoints),
        );
    });

    test('buildCommunityRankingReplay applies 11th-place tie-breaks only on the final ranking snapshot', () => {
        const participantCodeWithBetter11thPlace = SEMI_FINAL_1_CODES[11];
        const participantCodeWithWorse11thPlace = SEMI_FINAL_1_CODES[10];
        const customRanking = [
            ...SEMI_FINAL_1_CODES.slice(0, 10),
            participantCodeWithBetter11thPlace,
            participantCodeWithWorse11thPlace,
            ...SEMI_FINAL_1_CODES.slice(12),
        ];
        const replay = buildCommunityRankingReplay(
            [
                createUserRanking({
                    userId: 'user-1',
                    createdAt: '2026-05-09T20:00:00.000Z',
                    displayName: 'Voter 1',
                    rankingCodes: customRanking,
                }),
                createUserRanking({
                    userId: 'user-2',
                    createdAt: '2026-05-09T20:10:00.000Z',
                    displayName: 'Voter 2',
                    rankingCodes: customRanking,
                }),
            ],
            SEMI_FINAL_1_CODES,
        );

        const finalRankingCodes = replay.finalRanking.map((entry) => entry.code);

        expect(
            finalRankingCodes.indexOf(participantCodeWithBetter11thPlace),
        ).toBeLessThan(
            finalRankingCodes.indexOf(participantCodeWithWorse11thPlace),
        );
    });
});
