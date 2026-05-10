import { useMemo, useState } from 'react';
import ResultsCountryCard from '../../components/ResultsCountryCard/ResultsCountryCard';
import { getTwoColumnRankingItemPlacement } from './Results.helpers';

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
                    Aucun classement votant disponible pour cette session.
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
                <h2 className="results__panelTitle">Classements des votants</h2>
                <div className="results__carouselControls">
                    <button
                        type="button"
                        className="results__controlButton"
                        onClick={goToPreviousVoter}
                    >
                        Precedent
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

            <ol className="results__publishedRankingList">
                {currentVoter.ranking.map((participant, index) => {
                    const placement = getTwoColumnRankingItemPlacement(
                        index,
                        currentVoter.ranking.length,
                    );

                    return (
                        <li
                            key={`${currentVoter.userId}-${participant.code}`}
                            className="results__publishedRankingItem"
                            style={{
                                gridColumn: placement.column,
                                gridRow: placement.row,
                            }}
                        >
                            <span className="results__communityRankingPosition">
                                {index + 1}
                            </span>
                            <div className="results__publishedRankingCard">
                                <ResultsCountryCard country={participant} />
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
