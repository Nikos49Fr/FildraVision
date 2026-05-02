import './RankingSaveButton.scss';

export const RANKING_SAVE_STATUSES = {
    empty: 'empty',
    dirty: 'dirty',
    saved: 'saved',
    saving: 'saving',
    error: 'error',
};

const DEFAULT_LABELS = {
    [RANKING_SAVE_STATUSES.empty]: 'Soumettre',
    [RANKING_SAVE_STATUSES.dirty]: 'Mettre à jour',
    [RANKING_SAVE_STATUSES.saved]: 'Sauvegardé',
    [RANKING_SAVE_STATUSES.saving]: 'Sauvegarde en cours...',
    [RANKING_SAVE_STATUSES.error]: 'Erreur. Réessaie.',
};

const DISABLED_STATUSES = new Set([
    RANKING_SAVE_STATUSES.saved,
    RANKING_SAVE_STATUSES.saving,
    RANKING_SAVE_STATUSES.error,
]);

export default function RankingSaveButton({
    status = RANKING_SAVE_STATUSES.empty,
    onClick,
    className = '',
    labels = DEFAULT_LABELS,
}) {
    const resolvedStatus = DEFAULT_LABELS[status]
        ? status
        : RANKING_SAVE_STATUSES.empty;
    const isDisabled = DISABLED_STATUSES.has(resolvedStatus);
    const buttonClassName = [
        'rankingSaveButton',
        `rankingSaveButton--${resolvedStatus}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type="button"
            className={buttonClassName}
            data-status={resolvedStatus}
            disabled={isDisabled}
            onClick={onClick}
        >
            {labels[resolvedStatus]}
        </button>
    );
}
