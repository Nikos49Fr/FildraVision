import { useEffect, useState } from 'react';
import './RankingSaveButton.scss';
import TrashCanIcon from '../../assets/logos/trash-can-regular-full.svg?react';
import {
    RANKING_SAVE_STATUSES,
    DEFAULT_RANKING_SAVE_LABELS,
    DEFAULT_RANKING_SAVE_HELP_LABELS,
    DEFAULT_RANKING_SAVE_HELP_ICONS,
    DEFAULT_ACTIONABLE_RANKING_SAVE_STATUSES,
} from '../../utils/helpers/rankingSaveStatus';

const RESOLVED_STATUSES = new Set(Object.values(RANKING_SAVE_STATUSES));

export default function RankingSaveButton({
    status = RANKING_SAVE_STATUSES.empty,
    onClick,
    className = '',
    labels = DEFAULT_RANKING_SAVE_LABELS,
    helperLabels = DEFAULT_RANKING_SAVE_HELP_LABELS,
    helperIcons = DEFAULT_RANKING_SAVE_HELP_ICONS,
    actionableStatuses = DEFAULT_ACTIONABLE_RANKING_SAVE_STATUSES,
    showResetAction = false,
    onReset,
    resetActionLabel = 'Réinitialiser le vote',
    resetConfirmTitle = 'Réinitialiser ton vote ?',
    resetConfirmMessage = 'Cette action supprimera ton vote sauvegardé et remettra la liste dans son état initial.',
    resetConfirmCancelLabel = 'Annuler',
    resetConfirmSubmitLabel = 'Réinitialiser',
}) {
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const resolvedStatus = RESOLVED_STATUSES.has(status)
        ? status
        : RANKING_SAVE_STATUSES.empty;
    const isActionVisible = actionableStatuses.includes(resolvedStatus);
    const isBusy = resolvedStatus === RANKING_SAVE_STATUSES.saving;
    const canReset = showResetAction && typeof onReset === 'function';
    const rootClassName = ['rankingSave', className].filter(Boolean).join(' ');
    const buttonClassName = [
        'rankingSave__button',
        `rankingSave__button--${resolvedStatus}`,
    ]
        .filter(Boolean)
        .join(' ');
    const iconClassName = [
        'rankingSave__icon',
        `rankingSave__icon--${resolvedStatus}`,
    ]
        .filter(Boolean)
        .join(' ');

    const HelperIcon = helperIcons[resolvedStatus];

    useEffect(() => {
        if (!canReset && isResetConfirmOpen) {
            setIsResetConfirmOpen(false);
        }
    }, [canReset, isResetConfirmOpen]);

    useEffect(() => {
        if (!isResetConfirmOpen) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsResetConfirmOpen(false);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isResetConfirmOpen]);

    async function handleResetConfirm() {
        if (!canReset) {
            return;
        }

        await onReset();
        setIsResetConfirmOpen(false);
    }

    return (
        <>
            <div className={rootClassName} aria-busy={isBusy}>
                {HelperIcon ? (
                    <HelperIcon
                        className={iconClassName}
                        aria-hidden="true"
                        focusable="false"
                    />
                ) : null}
                <div
                    className="rankingSave__helper"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {helperLabels[resolvedStatus]}
                </div>
                <div className="rankingSave__actions">
                    {isActionVisible ? (
                        <button
                            type="button"
                            className={buttonClassName}
                            data-status={resolvedStatus}
                            onClick={onClick}
                            disabled={isBusy}
                        >
                            {labels[resolvedStatus]}
                        </button>
                    ) : null}
                    {canReset ? (
                        <button
                            type="button"
                            className="rankingSave__button rankingSave__button--reset"
                            onClick={() => setIsResetConfirmOpen(true)}
                            aria-label={resetActionLabel}
                            title={resetActionLabel}
                            disabled={isBusy}
                        >
                            <TrashCanIcon
                                className="rankingSave__resetIcon"
                                aria-hidden="true"
                                focusable="false"
                            />
                        </button>
                    ) : null}
                </div>
            </div>
            {isResetConfirmOpen ? (
                <div
                    className="rankingSave__modalOverlay"
                    role="presentation"
                    onClick={() => setIsResetConfirmOpen(false)}
                >
                    <div
                        className="rankingSave__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ranking-save-reset-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3
                            id="ranking-save-reset-title"
                            className="rankingSave__modalTitle"
                        >
                            {resetConfirmTitle}
                        </h3>
                        <p className="rankingSave__modalText">
                            {resetConfirmMessage}
                        </p>
                        <div className="rankingSave__modalActions">
                            <button
                                type="button"
                                className="rankingSave__modalButton rankingSave__modalButton--cancel"
                                onClick={() => setIsResetConfirmOpen(false)}
                            >
                                {resetConfirmCancelLabel}
                            </button>
                            <button
                                type="button"
                                className="rankingSave__modalButton rankingSave__modalButton--confirm"
                                onClick={handleResetConfirm}
                            >
                                {resetConfirmSubmitLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
