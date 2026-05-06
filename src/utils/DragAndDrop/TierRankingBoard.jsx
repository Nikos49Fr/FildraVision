import { useEffect, useRef, useState } from 'react';
import { DragDropProvider, DragOverlay, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { defaultGetItemId } from './DragAndDrop.helpers';
import {
    getNextBoardStateFromDragEvent,
} from './TierRankingBoard.helpers';

function BoardDropZone({
    id,
    className,
    children,
    label,
}) {
    const { ref, isDropTarget } = useDroppable({
        id,
        data: {
            containerId: id,
        },
    });

    return (
        <section
            ref={ref}
            className={['tierRankingBoard__zone', className]
                .filter(Boolean)
                .join(' ')}
            data-drop-target={isDropTarget}
            aria-label={label}
        >
            <div className="tierRankingBoard__zoneLabel">{label}</div>
            <div className="tierRankingBoard__zoneContent">{children}</div>
        </section>
    );
}

function BoardSortableItem({
    item,
    index,
    containerId,
    getItemId,
    renderItem,
    itemClassName,
}) {
    const itemId = getItemId(item, index);
    const { ref, isDragging, isDropTarget, sortable } = useSortable({
        id: itemId,
        index,
        group: containerId,
        data: item,
    });

    return (
        <div
            ref={ref}
            className={itemClassName}
            data-dragging={isDragging}
            data-drop-target={isDropTarget}
            data-sortable-id={itemId}
            data-container-id={containerId}
        >
            {renderItem(item, {
                index,
                id: itemId,
                containerId,
                isDragging,
                isDropTarget,
                sortable,
            })}
        </div>
    );
}

export default function TierRankingBoard({
    boardState,
    tiers,
    onChange,
    sourceId = 'source',
    sourceLabel = 'Pays à classer',
    getItemId = defaultGetItemId,
    renderItem,
    allowOutsideDrag = false,
    className = '',
    sourceClassName = '',
    boardClassName = '',
    tierClassName = '',
    itemClassName = '',
}) {
    const containerRef = useRef(null);
    const initialBoardStateRef = useRef(boardState);
    const projectedBoardStateRef = useRef(boardState);
    const [projectedBoardState, setProjectedBoardState] = useState(boardState);
    const [activeItemId, setActiveItemId] = useState(null);
    const tierIds = tiers.map((tier) => tier.id);
    const modifiers = allowOutsideDrag
        ? undefined
        : [
              RestrictToElement.configure({
                  element: () => containerRef.current,
              }),
          ];

    useEffect(() => {
        projectedBoardStateRef.current = projectedBoardState;
    }, [projectedBoardState]);

    useEffect(() => {
        if (activeItemId !== null) {
            return;
        }

        setProjectedBoardState(boardState);
        projectedBoardStateRef.current = boardState;
        initialBoardStateRef.current = boardState;
    }, [activeItemId, boardState]);

    function handleDragStart(event) {
        const sourceSortable = event.operation.source?.sortable;
        const sourceItem = event.operation.source?.data;

        if (!sourceSortable || !sourceItem) {
            return;
        }

        const itemId = getItemId(sourceItem, sourceSortable.initialIndex);

        initialBoardStateRef.current = boardState;
        projectedBoardStateRef.current = boardState;
        setProjectedBoardState(boardState);
        setActiveItemId(String(itemId));
    }

    function handleDragOver(event) {
        if (!event.operation.target) {
            return;
        }

        const currentBoardState = projectedBoardStateRef.current;
        const nextBoardState = getNextBoardStateFromDragEvent(
            currentBoardState,
            event,
            {
                sourceId,
                tierIds,
                getItemId,
            },
        );

        if (nextBoardState === currentBoardState) {
            return;
        }

        projectedBoardStateRef.current = nextBoardState;
        setProjectedBoardState(nextBoardState);
    }

    function resetProjectedBoardState(nextBoardState) {
        projectedBoardStateRef.current = nextBoardState;
        setProjectedBoardState(nextBoardState);
        setActiveItemId(null);
    }

    function handleDragCancel() {
        resetProjectedBoardState(initialBoardStateRef.current);
    }

    function handleDragEnd(event) {
        const currentProjectedBoardState = projectedBoardStateRef.current;
        const initialBoardState = initialBoardStateRef.current;
        const nextBoardState = getNextBoardStateFromDragEvent(
            currentProjectedBoardState,
            event,
            {
                sourceId,
                tierIds,
                getItemId,
            },
        );

        setActiveItemId(null);

        if (event.canceled) {
            resetProjectedBoardState(initialBoardState);
            return;
        }

        if (nextBoardState === currentProjectedBoardState) {
            if (currentProjectedBoardState === initialBoardState) {
                resetProjectedBoardState(boardState);
                return;
            }

            onChange(currentProjectedBoardState);
            return;
        }

        onChange(nextBoardState);
    }

    const displayedBoardState = projectedBoardState;

    return (
        <DragDropProvider
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={modifiers}
        >
            <div
                ref={containerRef}
                className={['tierRankingBoard', className]
                    .filter(Boolean)
                    .join(' ')}
            >
                <BoardDropZone
                    id={sourceId}
                    className={sourceClassName}
                    label={sourceLabel}
                >
                    {displayedBoardState.source.map((item, index) => (
                        <BoardSortableItem
                            key={String(getItemId(item, index))}
                            item={item}
                            index={index}
                            containerId={sourceId}
                            getItemId={getItemId}
                            renderItem={renderItem}
                            itemClassName={itemClassName}
                        />
                    ))}
                </BoardDropZone>

                <div className={boardClassName}>
                    {tiers.map((tier) => {
                        const tierItems =
                            displayedBoardState.tiers[tier.id] ?? [];

                        return (
                            <BoardDropZone
                                key={tier.id}
                                id={tier.id}
                                className={tierClassName}
                                label={tier.label}
                            >
                                {tierItems.map((item, index) => (
                                    <BoardSortableItem
                                        key={String(getItemId(item, index))}
                                        item={item}
                                        index={index}
                                        containerId={tier.id}
                                        getItemId={getItemId}
                                        renderItem={renderItem}
                                        itemClassName={itemClassName}
                                    />
                                ))}
                            </BoardDropZone>
                        );
                    })}
                </div>
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
                                containerId: source.sortable?.group ?? sourceId,
                                isDragging: true,
                                isDropTarget: false,
                                index: source.sortable?.index ?? -1,
                                sortable: source.sortable,
                            })}
                        </div>
                    );
                }}
            </DragOverlay>
        </DragDropProvider>
    );
}
