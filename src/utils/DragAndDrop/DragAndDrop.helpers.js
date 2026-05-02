export function defaultGetItemId(item, index) {
    if (item?.id != null) {
        return item.id;
    }

    if (item?.code != null) {
        return item.code;
    }

    if (index != null) {
        return index;
    }

    throw new Error(
        'Unable to resolve a draggable item id. Provide an `id`, a `code`, or a custom `getItemId` prop.',
    );
}

export function reorderItems(items, sourceId, targetId, getItemId) {
    if (sourceId == null || targetId == null || sourceId === targetId) {
        return items;
    }

    const sourceIndex = items.findIndex(
        (item, index) => String(getItemId(item, index)) === String(sourceId),
    );
    const targetIndex = items.findIndex(
        (item, index) => String(getItemId(item, index)) === String(targetId),
    );

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return items;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, movedItem);

    return nextItems;
}

export function reorderItemsByIndex(items, fromIndex, toIndex) {
    if (
        fromIndex == null ||
        toIndex == null ||
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length
    ) {
        return items;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);

    return nextItems;
}
