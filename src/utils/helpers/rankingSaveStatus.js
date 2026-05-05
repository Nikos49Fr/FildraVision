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

export const DEFAULT_RANKING_SAVE_LABELS = {
    [RANKING_SAVE_STATUSES.empty]: '→ Sauvegarder',
    [RANKING_SAVE_STATUSES.dirty]: '→ Mettre à jour',
    [RANKING_SAVE_STATUSES.saved]: 'Sauvegardé',
    [RANKING_SAVE_STATUSES.saving]: 'Sauvegarde en cours...',
    [RANKING_SAVE_STATUSES.error]: 'Erreur. Réessaie.',
};

export const DEFAULT_RANKING_SAVE_HELP_LABELS = {
    [RANKING_SAVE_STATUSES.empty]:
        'Sauvegarde ton 1er classement. Tu pourras le modifier utltérieurement.',
    [RANKING_SAVE_STATUSES.dirty]:
        'Des modifications ne sont pas enregistrées.',
    [RANKING_SAVE_STATUSES.saved]: 'Ton classement est bien sauvegardé',
    [RANKING_SAVE_STATUSES.saving]: 'Sauvegarde en cours...',
    [RANKING_SAVE_STATUSES.error]:
        "Une erreur s'est produite. Actualise la page et réessaie de soumettre ton classement.",
};

export const DEFAULT_RANKING_SAVE_HELP_ICONS = {
    [RANKING_SAVE_STATUSES.empty]: CloudError,
    [RANKING_SAVE_STATUSES.dirty]: CloudSynchro,
    [RANKING_SAVE_STATUSES.saved]: CloudSaved,
    [RANKING_SAVE_STATUSES.saving]: CloudUpdate,
    [RANKING_SAVE_STATUSES.error]: CloudError,
};

export const DEFAULT_ACTIONABLE_RANKING_SAVE_STATUSES = [
    RANKING_SAVE_STATUSES.empty,
    RANKING_SAVE_STATUSES.dirty,
];
