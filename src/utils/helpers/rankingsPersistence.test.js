import { describe, expect, test } from 'vitest';
import {
    areRankingCodesEqual,
    getRankingCodes,
    getRankingFromCodes,
    getRankingSaveStatus,
} from './rankingsPersistence.js';

function createParticipant(code) {
    return { code };
}

const ALL_PARTICIPANTS = [
    createParticipant('gr'),
    createParticipant('lt'),
    createParticipant('pt'),
    createParticipant('se'),
];

const FALLBACK_CODES = ALL_PARTICIPANTS.map((participant) => participant.code);

describe('rankingsPersistence', () => {
    test('getRankingCodes extracts only valid participant codes', () => {
        expect(
            getRankingCodes([
                createParticipant('gr'),
                null,
                {},
                createParticipant('lt'),
            ]),
        ).toEqual(['gr', 'lt']);
    });

    test('areRankingCodesEqual requires the same order and length', () => {
        expect(areRankingCodesEqual(['gr', 'lt'], ['gr', 'lt'])).toBe(true);
        expect(areRankingCodesEqual(['gr', 'lt'], ['lt', 'gr'])).toBe(false);
        expect(areRankingCodesEqual(['gr', 'lt'], ['gr'])).toBe(false);
    });

    test('getRankingFromCodes sanitizes invalid and duplicate codes, then appends missing participants', () => {
        expect(
            getRankingFromCodes(
                ['pt', 'pt', 'xx', 'gr'],
                FALLBACK_CODES,
                ALL_PARTICIPANTS,
            ).map((participant) => participant.code),
        ).toEqual(['pt', 'gr', 'lt', 'se']);
    });

    test('getRankingFromCodes falls back cleanly when participants are missing or rankingCodes is invalid', () => {
        expect(
            getRankingFromCodes(
                null,
                FALLBACK_CODES,
                ALL_PARTICIPANTS,
            ).map((participant) => participant.code),
        ).toEqual(FALLBACK_CODES);

        expect(
            getRankingFromCodes(
                ['gr', 'lt'],
                FALLBACK_CODES,
                null,
            ),
        ).toEqual([]);
    });

    test('getRankingSaveStatus distinguishes empty, saved, and dirty rankings', () => {
        expect(
            getRankingSaveStatus({
                databaseRankingCodes: null,
                currentRankingCodes: ['gr', 'lt'],
            }),
        ).toBe('empty');

        expect(
            getRankingSaveStatus({
                databaseRankingCodes: ['gr', 'lt'],
                currentRankingCodes: ['gr', 'lt'],
            }),
        ).toBe('saved');

        expect(
            getRankingSaveStatus({
                databaseRankingCodes: ['gr', 'lt'],
                currentRankingCodes: ['lt', 'gr'],
            }),
        ).toBe('dirty');
    });
});
