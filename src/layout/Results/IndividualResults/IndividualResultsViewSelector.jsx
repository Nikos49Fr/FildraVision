import {
    INDIVIDUAL_RESULTS_VIEW_ITEMS,
    INDIVIDUAL_RESULTS_VIEW_KEYS,
} from './IndividualResults.helpers';

export default function IndividualResultsViewSelector({
    selectedViewKey,
    selectedVoter,
    hasVoters,
    onViewChange,
    onPreviousVoter,
    onNextVoter,
    onSelectCurrentVoter,
}) {
    return (
        <div className="results__individualViewSelector">
            {INDIVIDUAL_RESULTS_VIEW_ITEMS.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    className="results__tabButton"
                    data-active={item.key === selectedViewKey}
                    onClick={() => onViewChange(item.key)}
                >
                    {item.label}
                </button>
            ))}
            <div
                className="results__individualVoterCarousel"
                data-active={selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.voter}
                data-disabled={!hasVoters}
            >
                <button
                    type="button"
                    className="results__individualVoterCarouselArrow"
                    onClick={onPreviousVoter}
                    disabled={!hasVoters}
                    aria-label="Votant précédent"
                >
                    ‹
                </button>
                <button
                    type="button"
                    className="results__individualVoterCarouselLabel"
                    onClick={onSelectCurrentVoter}
                    disabled={!hasVoters}
                >
                    {selectedVoter?.displayName ?? 'Aucun votant'}
                </button>
                <button
                    type="button"
                    className="results__individualVoterCarouselArrow"
                    onClick={onNextVoter}
                    disabled={!hasVoters}
                    aria-label="Votant suivant"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
