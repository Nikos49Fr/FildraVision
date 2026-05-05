import './RankingSaveButton.scss';
import CloudSaved from '../../assets/logos/cloud-check-saved.svg?react';
import CloudSynchro from '../../assets/logos/cloud-arrow-rotate-synchro.svg?react';
import CloudError from '../../assets/logos/cloud-xmark-error.svg?react';
import CloudUpdate from '../../assets/logos/cloud-arrow-up-update.svg?react';

export const RANKING_SAVE_STATUSES = {
    empty: 'empty',
    dirty: 'dirty',
    saved: 'saved',
    saving: 'saving',
    error: 'error',
};

const DEFAULT_LABELS = {
    [RANKING_SAVE_STATUSES.empty]: '→ Sauvegarder',
    [RANKING_SAVE_STATUSES.dirty]: '→ Mettre à jour',
    [RANKING_SAVE_STATUSES.saved]: 'Sauvegardé',
    [RANKING_SAVE_STATUSES.saving]: 'Sauvegarde en cours...',
    [RANKING_SAVE_STATUSES.error]: 'Erreur. Réessaie.',
};

const DEFAULT_HELP_LABELS = {
    [RANKING_SAVE_STATUSES.empty]: 'Classement non sauvegardé.',
    [RANKING_SAVE_STATUSES.dirty]:
        'Des modifications ne sont pas enregistrées.',
    [RANKING_SAVE_STATUSES.saved]: 'Le classement est bien sauvegardé',
    [RANKING_SAVE_STATUSES.saving]: 'Sauvegarde en cours...',
    [RANKING_SAVE_STATUSES.error]:
        "Une erreur s'est produite. Actualise la page et réessaie de soumettre ton classement.",
};

const DEFAULT_HELP_ICONS = {
    [RANKING_SAVE_STATUSES.empty]: CloudError,
    [RANKING_SAVE_STATUSES.dirty]: CloudSynchro,
    [RANKING_SAVE_STATUSES.saved]: CloudSaved,
    [RANKING_SAVE_STATUSES.saving]: CloudUpdate,
    [RANKING_SAVE_STATUSES.error]: CloudError,
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
    helper_labels = DEFAULT_HELP_LABELS,
    helper_icons = DEFAULT_HELP_ICONS,
}) {
    const resolvedStatus = DEFAULT_LABELS[status]
        ? status
        : RANKING_SAVE_STATUSES.empty;
    const isDisabled = DISABLED_STATUSES.has(resolvedStatus);
    const buttonClassName = [
        'rankingSave__button',
        `rankingSave__button--${resolvedStatus}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const iconClassName = [
        'rankingSave__icon',
        `rankingSave__icon--${resolvedStatus}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const HelperIcon = helper_icons[resolvedStatus];

    return (
        <div className="rankingSave">
            {HelperIcon ? <HelperIcon className={iconClassName} /> : null}
            <div className="rankingSave__helper">
                {helper_labels[resolvedStatus]}
            </div>
            {isDisabled ? (
                ''
            ) : (
                <button
                    type="button"
                    className={buttonClassName}
                    data-status={resolvedStatus}
                    disabled={isDisabled}
                    onClick={onClick}
                >
                    {labels[resolvedStatus]}
                </button>
            )}
        </div>
    );
}
