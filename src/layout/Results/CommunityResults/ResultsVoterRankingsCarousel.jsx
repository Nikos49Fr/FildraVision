import { useMemo, useState } from 'react';
import ResultsCountryCard from '../../../components/ResultsCountryCard/ResultsCountryCard';
import {
    EUROVISION_POINTS_BY_POSITION,
    getCommunityPointsLabelParts,
} from './CommunityResults.helpers';

function VoterAvatar({
    avatarUrl,
    displayName,
}) {
    if (avatarUrl) {
        return (
            <img
                className="results__voterAvatar"
                src={avatarUrl}
                alt={`Avatar de ${displayName}`}
            />
        );
    }

    return (
        <div className="results__voterAvatar results__voterAvatar--fallback">
            {displayName.charAt(0).toUpperCase()}
        </div>
    );
}

function PointsLabel({ points }) {
    const { value, suffix } = getCommunityPointsLabelParts(points);

    return (
        <>
            <span className="results__pointsValue">{value}</span>{' '}
            <span className="results__pointsSuffix">{suffix}</span>
        </>
    );
}

export default function ResultsVoterRankingsCarousel({
    voters,
}) {
    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const currentVoter = useMemo(
        () => voters[currentVoterIndex] ?? null,
        [currentVoterIndex, voters],
    );

    if (!currentVoter) {
        return (
            <section className="results__panel results__panel--carousel">
                <header className="results__panelHeader">
                    <h2 className="results__panelTitle">Classements des votants</h2>
                </header>
                <p className="results__emptyMessage">
                    Aucun classement disponible pour cette session.
                </p>
            </section>
        );
    }

    function goToPreviousVoter() {
        setCurrentVoterIndex((voterIndex) =>
            voterIndex === 0 ? voters.length - 1 : voterIndex - 1,
        );
    }

    function goToNextVoter() {
        setCurrentVoterIndex((voterIndex) =>
            voterIndex === voters.length - 1 ? 0 : voterIndex + 1,
        );
    }

    return (
        <section className="results__panel results__panel--carousel">
            <header className="results__panelHeader">
                <h2 className="results__panelTitle">Top 10 des votants</h2>
                <div className="results__carouselControls">
                    <button
                        type="button"
                        className="results__controlButton"
                        onClick={goToPreviousVoter}
                    >
                        Précédent
                    </button>
                    <button
                        type="button"
                        className="results__controlButton"
                        onClick={goToNextVoter}
                    >
                        Suivant
                    </button>
                </div>
            </header>

            <div className="results__voterMeta">
                <p className="results__voterCounter">
                    Votant {currentVoterIndex + 1} / {voters.length}
                </p>
                <div className="results__voterIdentity">
                    <VoterAvatar
                        avatarUrl={currentVoter.avatarUrl}
                        displayName={currentVoter.displayName}
                    />
                    <span className="results__voterName">
                        {currentVoter.displayName}
                    </span>
                </div>
            </div>

            <ol className="results__revealedRankingList">
                {currentVoter.topTenRanking.map((participant, index) => (
                    <li
                        key={`${currentVoter.userId}-${participant.code}`}
                        className="results__revealedRankingItem"
                    >
                        <div className="results__revealedRankingCard">
                            <ResultsCountryCard country={participant} />
                        </div>
                        <span className="results__revealedRankingPoints">
                            <PointsLabel
                                points={
                                    EUROVISION_POINTS_BY_POSITION[index] ?? 0
                                }
                            />
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
