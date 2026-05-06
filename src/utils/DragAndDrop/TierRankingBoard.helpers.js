import { defaultGetItemId } from './DragAndDrop.helpers';

export function getBoardContainerItems(boardState, containerId, sourceId) {
    if (containerId === sourceId) {
        return boardState.source;
    }

    return boardState.tiers[containerId] ?? [];
}

export function findBoardItemContainerId(
    boardState,
    itemId,
    sourceId,
    tierIds,
    getItemId = defaultGetItemId,
) {
    if (
        boardState.source.some(
            (item, index) => String(getItemId(item, index)) === String(itemId),
        )
    ) {
        return sourceId;
    }

    for (const tierId of tierIds) {
        const tierItems = boardState.tiers[tierId] ?? [];

        if (
            tierItems.some(
                (item, index) =>
                    String(getItemId(item, index)) === String(itemId),
            )
        ) {
            return tierId;
        }
    }

    return null;
}

export function moveBoardItem(
    boardState,
    {
        itemId,
        fromContainerId,
        toContainerId,
        toIndex,
        useProjectedIndex = false,
        sourceId,
        tierIds,
        getItemId = defaultGetItemId,
    },
) {
    if (!fromContainerId || !toContainerId) {
        return boardState;
    }

    const nextBoardState = {
        source: [...boardState.source],
        tiers: Object.fromEntries(
            tierIds.map((tierId) => [tierId, [...(boardState.tiers[tierId] ?? [])]]),
        ),
    };

    const fromItems = getBoardContainerItems(
        nextBoardState,
        fromContainerId,
        sourceId,
    );
    const sourceIndex = fromItems.findIndex(
        (item, index) => String(getItemId(item, index)) === String(itemId),
    );

    if (sourceIndex === -1) {
        return boardState;
    }

    const [movedItem] = fromItems.splice(sourceIndex, 1);
    const targetItems = getBoardContainerItems(
        nextBoardState,
        toContainerId,
        sourceId,
    );

    let nextIndex =
        typeof toIndex === 'number' && toIndex >= 0
            ? Math.min(toIndex, targetItems.length)
            : targetItems.length;

    if (
        !useProjectedIndex &&
        fromContainerId === toContainerId &&
        sourceIndex < nextIndex
    ) {
        nextIndex -= 1;
    }

    targetItems.splice(nextIndex, 0, movedItem);

    return nextBoardState;
}
