import { useLayoutEffect, useRef } from 'react';

export default function useFlipListAnimation(
    items,
    getItemKey,
    {
        duration = 480,
        easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
    } = {},
) {
    const elementRefs = useRef(new Map());
    const previousRectsRef = useRef(new Map());
    const previousSignatureRef = useRef('');

    function registerItemRef(itemKey) {
        return (element) => {
            if (element) {
                elementRefs.current.set(itemKey, element);
                return;
            }

            elementRefs.current.delete(itemKey);
        };
    }

    useLayoutEffect(() => {
        const currentRects = new Map();
        const currentSignature = items
            .map((item, index) => String(getItemKey(item, index)))
            .join('|');
        const shouldAnimate =
            previousSignatureRef.current !== '' &&
            previousSignatureRef.current !== currentSignature;

        items.forEach((item, index) => {
            const itemKey = String(getItemKey(item, index));
            const element = elementRefs.current.get(itemKey);

            if (!element) {
                return;
            }

            const currentRect = element.getBoundingClientRect();
            currentRects.set(itemKey, currentRect);

            if (!shouldAnimate) {
                return;
            }

            const previousRect = previousRectsRef.current.get(itemKey);

            if (!previousRect) {
                return;
            }

            const deltaX = previousRect.left - currentRect.left;
            const deltaY = previousRect.top - currentRect.top;

            if (deltaX === 0 && deltaY === 0) {
                return;
            }

            element.animate(
                [
                    {
                        transform: `translate(${deltaX}px, ${deltaY}px)`,
                    },
                    {
                        transform: 'translate(0, 0)',
                    },
                ],
                {
                    duration,
                    easing,
                },
            );
        });

        previousRectsRef.current = currentRects;
        previousSignatureRef.current = currentSignature;
    }, [duration, easing, getItemKey, items]);

    return {
        registerItemRef,
    };
}
