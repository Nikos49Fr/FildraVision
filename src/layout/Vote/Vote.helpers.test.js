import { describe, expect, test } from 'vitest';
import {
    areSerializedVoteBoardStatesEqual,
    getDefaultVoteBoardState,
    getVotePageState,
    getVoteBoardStateFromStoredValue,
    getVoteRankingCodes,
    getVoteSaveStatus,
    serializeVoteBoardState,
} from './Vote.helpers.js';

function createParticipant(code) {
    return { code };
}

const TIERS = [
    { id: 'vote-tier-s', label: 'S' },
    { id: 'vote-tier-a', label: 'A' },
    { id: 'vote-tier-b', label: 'B' },
];

const ALL_PARTICIPANTS = [
    createParticipant('gr'),
    createParticipant('lt'),
    createParticipant('pt'),
    createParticipant('se'),
];

const FALLBACK_CODES = ALL_PARTICIPANTS.map((participant) => participant.code);

describe('Vote.helpers', () => {
    test('getDefaultVoteBoardState places all fallback participants in the source and initializes empty tiers', () => {
        const boardState = getDefaultVoteBoardState(
            FALLBACK_CODES,
            ALL_PARTICIPANTS,
            TIERS,
        );

        expect(boardState.source.map((participant) => participant.code)).toEqual(
            FALLBACK_CODES,
        );
        expect(boardState.tiers).toEqual({
            'vote-tier-s': [],
            'vote-tier-a': [],
            'vote-tier-b': [],
        });
    });

    test('getVoteBoardStateFromStoredValue sanitizes duplicates and appends missing participants to the source', () => {
        const boardState = getVoteBoardStateFromStoredValue(
            {
                source: ['se', 'gr'],
                tiers: {
                    'vote-tier-s': ['gr', 'lt'],
                    'vote-tier-a': ['pt', 'pt'],
                },
            },
            FALLBACK_CODES,
            ALL_PARTICIPANTS,
            TIERS,
        );

        expect(
            boardState.tiers['vote-tier-s'].map((participant) => participant.code),
        ).toEqual(['gr', 'lt']);
        expect(
            boardState.tiers['vote-tier-a'].map((participant) => participant.code),
        ).toEqual(['pt']);
        expect(
            boardState.tiers['vote-tier-b'].map((participant) => participant.code),
        ).toEqual([]);
        expect(boardState.source.map((participant) => participant.code)).toEqual([
            'se',
        ]);
    });

    test('serializeVoteBoardState and getVoteRankingCodes keep tier order before source order', () => {
        const boardState = {
            source: [createParticipant('se')],
            tiers: {
                'vote-tier-s': [createParticipant('gr')],
                'vote-tier-a': [createParticipant('lt'), createParticipant('pt')],
                'vote-tier-b': [],
            },
        };

        expect(serializeVoteBoardState(boardState, TIERS)).toEqual({
            source: ['se'],
            tiers: {
                'vote-tier-s': ['gr'],
                'vote-tier-a': ['lt', 'pt'],
                'vote-tier-b': [],
            },
        });
        expect(getVoteRankingCodes(boardState, TIERS)).toEqual([
            'gr',
            'lt',
            'pt',
            'se',
        ]);
    });

    test('areSerializedVoteBoardStatesEqual detects tier distribution changes', () => {
        const referenceBoardState = {
            source: [],
            tiers: {
                'vote-tier-s': ['gr'],
                'vote-tier-a': ['lt'],
                'vote-tier-b': [],
            },
        };
        const changedBoardState = {
            source: [],
            tiers: {
                'vote-tier-s': [],
                'vote-tier-a': ['gr', 'lt'],
                'vote-tier-b': [],
            },
        };

        expect(
            areSerializedVoteBoardStatesEqual(
                referenceBoardState,
                referenceBoardState,
                TIERS,
            ),
        ).toBe(true);
        expect(
            areSerializedVoteBoardStatesEqual(
                referenceBoardState,
                changedBoardState,
                TIERS,
            ),
        ).toBe(false);
    });

    test('getVoteSaveStatus stays dirty when the flattened ranking is identical but the board state differs', () => {
        const databaseBoardState = {
            source: [],
            tiers: {
                'vote-tier-s': ['gr'],
                'vote-tier-a': ['lt'],
                'vote-tier-b': [],
            },
        };
        const currentBoardState = {
            source: [],
            tiers: {
                'vote-tier-s': [],
                'vote-tier-a': [createParticipant('gr'), createParticipant('lt')],
                'vote-tier-b': [],
            },
        };

        expect(
            getVoteSaveStatus({
                databaseRankingCodes: ['gr', 'lt'],
                databaseBoardState,
                currentBoardState,
                tiers: TIERS,
            }),
        ).toBe('dirty');
    });

    test('getVotePageState enables ranking only for authenticated users when a session is open', () => {
        expect(
            getVotePageState({
                isProfileLoading: false,
                isOpenVoteSessionLoading: false,
                isAuthenticated: true,
                openSessionKey: 'semi_final_1',
            }),
        ).toMatchObject({
            isRankingEnabled: true,
            title: 'Demi-Finale 1',
            statusLabel: 'Votes ouverts',
            statusVariant: 'open',
            shouldShowPreview: false,
        });
    });

    test('getVotePageState exposes the guest preview state when a vote session is open but the user is not authenticated', () => {
        expect(
            getVotePageState({
                isProfileLoading: false,
                isOpenVoteSessionLoading: false,
                isAuthenticated: false,
                openSessionKey: 'semi_final_2',
            }),
        ).toMatchObject({
            isRankingEnabled: false,
            title: 'Demi-Finale 2',
            statusLabel: 'Connecte-toi pour voter',
            statusVariant: 'auth',
            shouldShowPreview: true,
        });
    });

    test('getVotePageState falls back to the closed state when no vote session is open', () => {
        expect(
            getVotePageState({
                isProfileLoading: false,
                isOpenVoteSessionLoading: false,
                isAuthenticated: true,
                openSessionKey: null,
            }),
        ).toMatchObject({
            isRankingEnabled: false,
            title: 'Session de vote',
            statusLabel: 'Votes fermés',
            statusVariant: 'closed',
            shouldShowPreview: false,
        });
    });
});
