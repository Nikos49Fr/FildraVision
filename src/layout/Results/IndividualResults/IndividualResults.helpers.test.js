import { describe, expect, test } from 'vitest';
import {
    buildIndividualLeaderboard,
    buildIndividualRankingBreakdown,
    formatIndividualPointsLabel,
    getIndividualParticipants,
    getIndividualPointsLabelParts,
    getPlacementScore,
    getPodiumBonus,
} from './IndividualResults.helpers.js';

const PARTICIPANTS = getIndividualParticipants('semi_final_1');

describe('IndividualResults.helpers', () => {
    test('getPlacementScore applies the expected point scale', () => {
        expect(getPlacementScore(0)).toBe(7);
        expect(getPlacementScore(1)).toBe(4);
        expect(getPlacementScore(2)).toBe(1);
        expect(getPlacementScore(3)).toBe(1);
        expect(getPlacementScore(4)).toBe(0);
    });

    test('getPodiumBonus rewards only exact podium predictions', () => {
        expect(getPodiumBonus(1, 1)).toBe(20);
        expect(getPodiumBonus(2, 2)).toBe(16);
        expect(getPodiumBonus(3, 3)).toBe(14);
        expect(getPodiumBonus(1, 2)).toBe(0);
        expect(getPodiumBonus(4, 4)).toBe(0);
    });

    test('buildIndividualRankingBreakdown combines placement points and podium bonus', () => {
        const officialRanking = PARTICIPANTS;
        const predictedRanking = [
            PARTICIPANTS[0],
            PARTICIPANTS[2],
            PARTICIPANTS[1],
            ...PARTICIPANTS.slice(3),
        ];

        const breakdown = buildIndividualRankingBreakdown(
            predictedRanking,
            officialRanking,
        );

        expect(breakdown[0]).toMatchObject({
            code: PARTICIPANTS[0].code,
            placementPoints: 7,
            podiumBonus: 20,
            totalPoints: 27,
        });
        expect(breakdown[1]).toMatchObject({
            code: PARTICIPANTS[2].code,
            placementPoints: 4,
            podiumBonus: 0,
            totalPoints: 4,
        });
        expect(breakdown[2]).toMatchObject({
            code: PARTICIPANTS[1].code,
            placementPoints: 4,
            podiumBonus: 0,
            totalPoints: 4,
        });
    });

    test('buildIndividualLeaderboard sorts by descending total score and keeps community first on ties', () => {
        const officialRanking = PARTICIPANTS;
        const communityRanking = PARTICIPANTS;
        const voters = [
            {
                userId: 'voter-b',
                displayName: 'Voter B',
                avatarUrl: null,
                ranking: [...PARTICIPANTS],
            },
            {
                userId: 'voter-a',
                displayName: 'Voter A',
                avatarUrl: null,
                ranking: [...PARTICIPANTS].reverse(),
            },
        ];

        const leaderboard = buildIndividualLeaderboard({
            officialRanking,
            communityRanking,
            voters,
        });

        expect(leaderboard[0]).toMatchObject({
            id: 'community',
            isCommunity: true,
            totalScore: leaderboard[1].totalScore,
        });
        expect(leaderboard.map((entry) => entry.position)).toEqual([1, 2, 3]);
        expect(leaderboard[2].displayName).toBe('Voter A');
    });

    test('individual points labels keep the expected prefix and suffix', () => {
        expect(formatIndividualPointsLabel(1)).toBe('1 pt');
        expect(formatIndividualPointsLabel(12, { withPrefix: true })).toBe(
            '+ 12 pts',
        );
        expect(getIndividualPointsLabelParts(7, { withPrefix: true })).toEqual({
            prefix: '+',
            value: '7',
            suffix: 'pts',
        });
    });
});
