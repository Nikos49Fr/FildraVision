import { useRef } from 'react';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import {
    defaultGetItemId,
    reorderItems,
    reorderItemsByIndex,
} from './DragAndDrop.helpers';

function SortableItem({
    item,
    index,
    group,
    getItemId,
    renderItem,
    itemClassName,
}) {
    const itemId = getItemId(item, index);
    const { ref, isDragging, isDropTarget, sortable } = useSortable({
        id: itemId,
        index,
        group,
        data: item,
    });

    return (
        <div
            ref={ref}
            className={itemClassName}
            data-dragging={isDragging}
            data-drop-target={isDropTarget}
            data-sortable-id={itemId}
        >
            {renderItem(item, {
                index,
                id: itemId,
                isDragging,
                isDropTarget,
                sortable,
            })}
        </div>
    );
}

export default function DragAndDrop({
    items,
    renderItem,
    getItemId = defaultGetItemId,
    allowOutsideDrag = false,
    onChange,
    className = '',
    itemClassName = '',
    group = 'default',
}) {
    const containerRef = useRef(null);

    const modifiers = allowOutsideDrag
        ? undefined
        : [
              RestrictToElement.configure({
                  element: () => containerRef.current,
              }),
          ];

    function handleDragEnd(event) {
        if (event.canceled) {
            return;
        }

        const source = event.operation.source;
        let nextItems = items;

        if (
            source &&
            typeof source.initialIndex === 'number' &&
            typeof source.index === 'number'
        ) {
            nextItems = reorderItemsByIndex(
                items,
                source.initialIndex,
                source.index,
            );
        } else {
            const sourceId = event.operation.source?.id;
            const targetId = event.operation.target?.id;
            nextItems = reorderItems(items, sourceId, targetId, getItemId);
        }

        if (nextItems === items) {
            return;
        }

        if (onChange) {
            onChange(nextItems);
        }
    }

    return (
        <DragDropProvider onDragEnd={handleDragEnd} modifiers={modifiers}>
            <div ref={containerRef} className={className}>
                {items.map((item, index) => (
                    <SortableItem
                        key={String(getItemId(item, index))}
                        item={item}
                        index={index}
                        group={group}
                        getItemId={getItemId}
                        renderItem={renderItem}
                        itemClassName={itemClassName}
                    />
                ))}
            </div>

            <DragOverlay>
                {(source) => {
                    const activeItem = source.data;

                    if (!activeItem) {
                        return null;
                    }

                    return (
                        <div className={itemClassName} data-drag-overlay="true">
                            {renderItem(activeItem, {
                                id: source.id,
                                isDragging: true,
                                isDropTarget: false,
                                index: items.findIndex(
                                    (item, index) =>
                                        String(getItemId(item, index)) ===
                                        String(source.id),
                                ),
                                sortable: source.sortable,
                            })}
                        </div>
                    );
                }}
            </DragOverlay>
        </DragDropProvider>
    );
}
