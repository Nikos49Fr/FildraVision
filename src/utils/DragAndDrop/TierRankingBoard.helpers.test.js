import { describe, expect, test } from 'vitest';
import {
    findBoardItemContainerId,
    getNextBoardStateFromDragEvent,
    moveBoardItem,
} from './TierRankingBoard.helpers.js';

const SOURCE_ID = 'vote-source';
const TIER_IDS = ['vote-tier-s', 'vote-tier-a', 'vote-tier-b'];

function createParticipant(code) {
    return { code };
}

function createBoardState() {
    return {
        source: [
            createParticipant('cy'),
            createParticipant('ee'),
            createParticipant('fi'),
        ],
        tiers: {
            'vote-tier-s': [createParticipant('gr'), createParticipant('lt')],
            'vote-tier-a': [
                createParticipant('pt'),
                createParticipant('se'),
                createParticipant('ge'),
            ],
            'vote-tier-b': [],
        },
    };
}

function createDragEvent({
    sourceItem,
    sourceIndex,
    initialIndex = sourceIndex,
    initialGroup,
    projectedIndex,
    targetId,
    targetGroup,
    targetIndex,
}) {
    const target = {};

    if (targetId != null) {
        target.id = targetId;
    }

    if (targetGroup != null || targetIndex != null) {
        target.sortable = {};

        if (targetGroup != null) {
            target.sortable.group = targetGroup;
        }

        if (targetIndex != null) {
            target.sortable.index = targetIndex;
        }
    }

    return {
        operation: {
            source: {
                data: sourceItem,
                sortable: {
                    index: projectedIndex,
                    initialIndex,
                    initialGroup,
                },
            },
            target: Object.keys(target).length > 0 ? target : null,
        },
    };
}

describe('TierRankingBoard.helpers', () => {
    test('findBoardItemContainerId resolves source, tier, and missing items', () => {
        const boardState = createBoardState();

        expect(
            findBoardItemContainerId(
                boardState,
                'ee',
                SOURCE_ID,
                TIER_IDS,
            ),
        ).toBe(SOURCE_ID);
        expect(
            findBoardItemContainerId(
                boardState,
                'se',
                SOURCE_ID,
                TIER_IDS,
            ),
        ).toBe('vote-tier-a');
        expect(
            findBoardItemContainerId(
                boardState,
                'xx',
                SOURCE_ID,
                TIER_IDS,
            ),
        ).toBeNull();
    });

    test('moveBoardItem appends inside the same tier when using projected indexes', () => {
        const boardState = createBoardState();

        const nextBoardState = moveBoardItem(boardState, {
            itemId: 'gr',
            fromContainerId: 'vote-tier-s',
            toContainerId: 'vote-tier-s',
            toIndex: 1,
            useProjectedIndex: true,
            sourceId: SOURCE_ID,
            tierIds: TIER_IDS,
        });

        expect(
            nextBoardState.tiers['vote-tier-s'].map(
                (participant) => participant.code,
            ),
        ).toEqual(['lt', 'gr']);
    });

    test('moveBoardItem returns the same reference when nothing actually changes', () => {
        const boardState = createBoardState();

        const nextBoardState = moveBoardItem(boardState, {
            itemId: 'pt',
            fromContainerId: 'vote-tier-a',
            toContainerId: 'vote-tier-a',
            toIndex: 0,
            useProjectedIndex: true,
            sourceId: SOURCE_ID,
            tierIds: TIER_IDS,
        });

        expect(nextBoardState).toBe(boardState);
    });

    test('getNextBoardStateFromDragEvent reorders inside the same tier when dragging to the last position', () => {
        const boardState = createBoardState();

        const nextBoardState = getNextBoardStateFromDragEvent(
            boardState,
            createDragEvent({
                sourceItem: boardState.tiers['vote-tier-s'][0],
                sourceIndex: 0,
                initialGroup: 'vote-tier-s',
                projectedIndex: 1,
                targetId: 'lt',
                targetGroup: 'vote-tier-s',
                targetIndex: 1,
            }),
            {
                sourceId: SOURCE_ID,
                tierIds: TIER_IDS,
            },
        );

        expect(
            nextBoardState.tiers['vote-tier-s'].map(
                (participant) => participant.code,
            ),
        ).toEqual(['lt', 'gr']);
    });

    test('getNextBoardStateFromDragEvent moves an item from a tier back to the source zone using the projected index', () => {
        const boardState = createBoardState();

        const nextBoardState = getNextBoardStateFromDragEvent(
            boardState,
            createDragEvent({
                sourceItem: boardState.tiers['vote-tier-a'][1],
                sourceIndex: 1,
                initialGroup: 'vote-tier-a',
                projectedIndex: 1,
                targetId: SOURCE_ID,
            }),
            {
                sourceId: SOURCE_ID,
                tierIds: TIER_IDS,
            },
        );

        expect(
            nextBoardState.source.map((participant) => participant.code),
        ).toEqual(['cy', 'se', 'ee', 'fi']);
        expect(
            nextBoardState.tiers['vote-tier-a'].map(
                (participant) => participant.code,
            ),
        ).toEqual(['pt', 'ge']);
    });

    test('getNextBoardStateFromDragEvent uses the target tier instead of the projected source group when changing zones', () => {
        const boardState = createBoardState();

        const nextBoardState = getNextBoardStateFromDragEvent(
            boardState,
            createDragEvent({
                sourceItem: boardState.source[0],
                sourceIndex: 0,
                initialGroup: SOURCE_ID,
                projectedIndex: 0,
                targetId: 'vote-tier-b',
                targetGroup: 'vote-tier-b',
                targetIndex: 0,
            }),
            {
                sourceId: SOURCE_ID,
                tierIds: TIER_IDS,
            },
        );

        expect(
            nextBoardState.source.map((participant) => participant.code),
        ).toEqual(['ee', 'fi']);
        expect(
            nextBoardState.tiers['vote-tier-b'].map(
                (participant) => participant.code,
            ),
        ).toEqual(['cy']);
    });

    test('getNextBoardStateFromDragEvent appends into an empty tier when no target sortable index exists', () => {
        const boardState = createBoardState();

        const nextBoardState = getNextBoardStateFromDragEvent(
            boardState,
            createDragEvent({
                sourceItem: boardState.source[1],
                sourceIndex: 1,
                initialGroup: SOURCE_ID,
                projectedIndex: undefined,
                targetId: 'vote-tier-b',
            }),
            {
                sourceId: SOURCE_ID,
                tierIds: TIER_IDS,
            },
        );

        expect(
            nextBoardState.source.map((participant) => participant.code),
        ).toEqual(['cy', 'fi']);
        expect(
            nextBoardState.tiers['vote-tier-b'].map(
                (participant) => participant.code,
            ),
        ).toEqual(['ee']);
    });
});
