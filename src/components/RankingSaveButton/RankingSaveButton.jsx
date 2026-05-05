import './RankingSaveButton.scss';
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
}) {
    const resolvedStatus = RESOLVED_STATUSES.has(status)
        ? status
        : RANKING_SAVE_STATUSES.empty;
    const isActionVisible = actionableStatuses.includes(resolvedStatus);
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

    return (
        <div
            className={rootClassName}
            aria-busy={resolvedStatus === RANKING_SAVE_STATUSES.saving}
        >
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
            {isActionVisible ? (
                <button
                    type="button"
                    className={buttonClassName}
                    data-status={resolvedStatus}
                    onClick={onClick}
                >
                    {labels[resolvedStatus]}
                </button>
            ) : null}
        </div>
    );
}
