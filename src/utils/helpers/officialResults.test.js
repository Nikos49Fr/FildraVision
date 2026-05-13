import { describe, expect, test } from 'vitest';
import {
    areOfficialQualificationBoardStatesEqual,
    flattenOfficialQualificationBoardState,
    getOfficialQualificationBoardStateFromRankingCodes,
    isOfficialQualificationBoardStateComplete,
    OFFICIAL_NON_QUALIFIED_TIER_ID,
} from './officialResults.js';

describe('officialResults helpers', () => {
    test('builds a qualification board state with the first 10 countries qualified', () => {
        const participantCodes = [
            'AA',
            'BB',
            'CC',
            'DD',
            'EE',
            'FF',
            'GG',
            'HH',
            'II',
            'JJ',
            'KK',
            'LL',
            'MM',
            'NN',
            'OO',
        ];

        const boardState = getOfficialQualificationBoardStateFromRankingCodes(
            participantCodes,
            participantCodes,
        );

        expect(boardState.source).toEqual(participantCodes.slice(0, 10));
        expect(boardState.tiers[OFFICIAL_NON_QUALIFIED_TIER_ID]).toEqual(
            participantCodes.slice(10),
        );
        expect(flattenOfficialQualificationBoardState(boardState)).toEqual(
            participantCodes,
        );
        expect(
            isOfficialQualificationBoardStateComplete(boardState, participantCodes),
        ).toBe(true);
    });

    test('compares qualification board states on both zones', () => {
        const referenceBoardState = {
            source: ['AA', 'BB'],
            tiers: {
                [OFFICIAL_NON_QUALIFIED_TIER_ID]: ['CC', 'DD'],
            },
        };

        expect(
            areOfficialQualificationBoardStatesEqual(referenceBoardState, {
                source: ['AA', 'BB'],
                tiers: {
                    [OFFICIAL_NON_QUALIFIED_TIER_ID]: ['CC', 'DD'],
                },
            }),
        ).toBe(true);
        expect(
            areOfficialQualificationBoardStatesEqual(referenceBoardState, {
                source: ['AA'],
                tiers: {
                    [OFFICIAL_NON_QUALIFIED_TIER_ID]: ['BB', 'CC', 'DD'],
                },
            }),
        ).toBe(false);
    });
});
