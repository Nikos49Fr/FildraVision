import { describe, expect, test } from 'vitest';
import {
    buildIndividualLeaderboard,
    buildIndividualRankingBreakdown,
    buildQualificationRankingBreakdown,
    formatIndividualPointsLabel,
    getIndividualParticipants,
    getIndividualPointsLabelParts,
    getPlacementScore,
    getPodiumBonus,
    getQualificationScore,
} from './IndividualResults.helpers.js';

const PARTICIPANTS = getIndividualParticipants('semi_final_1');

describe('IndividualResults.helpers', () => {
    test('getPlacementScore applies the expected point scale', () => {
        expect(getPlacementScore(0)).toBe(12);
        expect(getPlacementScore(1)).toBe(10);
        expect(getPlacementScore(2)).toBe(6);
        expect(getPlacementScore(3)).toBe(6);
        expect(getPlacementScore(4)).toBe(1);
    });

    test('getPodiumBonus rewards only exact podium predictions', () => {
        expect(getPodiumBonus(1, 1)).toBe(48);
        expect(getPodiumBonus(2, 2)).toBe(36);
        expect(getPodiumBonus(3, 3)).toBe(24);
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
            placementPoints: 12,
            podiumBonus: 48,
            totalPoints: 60,
        });
        expect(breakdown[1]).toMatchObject({
            code: PARTICIPANTS[2].code,
            placementPoints: 10,
            podiumBonus: 0,
            totalPoints: 10,
        });
        expect(breakdown[2]).toMatchObject({
            code: PARTICIPANTS[1].code,
            placementPoints: 10,
            podiumBonus: 0,
            totalPoints: 10,
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
            sessionKey: 'final',
            officialRanking,
            communityRanking,
            qualifiedParticipantCodes: [],
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

    test('getQualificationScore rewards only qualified songs inside the top 10', () => {
        expect(getQualificationScore(1, true)).toBe(10);
        expect(getQualificationScore(5, true)).toBe(6);
        expect(getQualificationScore(10, true)).toBe(1);
        expect(getQualificationScore(11, true)).toBe(0);
        expect(getQualificationScore(3, false)).toBe(0);
    });

    test('buildQualificationRankingBreakdown scores semi-final predictions from the qualified set only', () => {
        const predictedRanking = PARTICIPANTS;
        const qualifiedParticipantCodes = [
            PARTICIPANTS[0].code,
            PARTICIPANTS[2].code,
            PARTICIPANTS[9].code,
        ];

        const breakdown = buildQualificationRankingBreakdown(
            predictedRanking,
            qualifiedParticipantCodes,
        );

        expect(breakdown[0]).toMatchObject({
            code: PARTICIPANTS[0].code,
            totalPoints: 10,
            isQualified: true,
        });
        expect(breakdown[1]).toMatchObject({
            code: PARTICIPANTS[1].code,
            totalPoints: 0,
            isQualified: false,
        });
        expect(breakdown[9]).toMatchObject({
            code: PARTICIPANTS[9].code,
            totalPoints: 1,
            isQualified: true,
        });
        expect(breakdown[10].totalPoints).toBe(0);
    });
});
