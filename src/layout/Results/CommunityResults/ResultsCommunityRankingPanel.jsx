import ResultsCountryCard from '../../../components/ResultsCountryCard/ResultsCountryCard';
import {
    COMMUNITY_REPLAY_ANIMATION_DURATIONS,
    getCommunityPointsLabelParts,
    getTwoColumnRankingItemPlacement,
} from './CommunityResults.helpers';
import useFlipListAnimation from './useFlipListAnimation';

function PointsLabel({
    points,
    prefix = '',
    className = '',
    dataTransferPhase = null,
}) {
    const { value, suffix } = getCommunityPointsLabelParts(points);

    return (
        <span className={className} data-transfer-phase={dataTransferPhase}>
            {prefix ? (
                <span className="results__pointsPrefix">{prefix}</span>
            ) : null}
            <span className="results__pointsValue">{value}</span>{' '}
            <span className="results__pointsSuffix">{suffix}</span>
        </span>
    );
}

export default function ResultsCommunityRankingPanel({
    title,
    ranking,
    showPositions = true,
    showPoints = true,
    highlightedParticipantCode = null,
    highlightedScoreParticipantCode = null,
    highlightedScorePhase = null,
    latestAward = null,
    animatedTransfer = null,
    isPointsAwardPhase = false,
    registerAwardTargetRef = null,
    emptyMessage = 'Aucun classement communautaire disponible pour le moment.',
}) {
    const { registerItemRef } = useFlipListAnimation(
        ranking,
        (entry) => entry.code,
        {
            duration: COMMUNITY_REPLAY_ANIMATION_DURATIONS.rankingReorderMs,
        },
    );

    return (
        <section className="results__panel results__panel--ranking">
            <header className="results__panelHeader">
                <h2 className="results__panelTitle">{title}</h2>
            </header>
            {ranking.length === 0 ? (
                <p className="results__emptyMessage">{emptyMessage}</p>
            ) : (
                <ol className="results__communityRankingList">
                    {ranking.map((entry, index) => {
                        const placement = getTwoColumnRankingItemPlacement(
                            index,
                            ranking.length,
                        );

                        return (
                            <li
                                key={entry.code}
                                ref={registerItemRef(entry.code)}
                                className={`results__communityRankingItem${
                                    !showPoints
                                        ? ' results__communityRankingItem--simple'
                                        : ''
                                }`}
                                data-highlighted={
                                    entry.code === highlightedParticipantCode
                                }
                                data-points-awarded={
                                    isPointsAwardPhase &&
                                    latestAward?.participantCode === entry.code
                                }
                                style={{
                                    gridColumn: placement.column,
                                    gridRow: placement.row,
                                }}
                            >
                                <div
                                    className={`results__communityRankingMeta${
                                        !showPositions
                                            ? ' results__communityRankingMeta--noPosition'
                                            : ''
                                    }`}
                                >
                                    {showPositions ? (
                                        <span className="results__communityRankingPosition">
                                            {entry.position}
                                        </span>
                                    ) : null}
                                    <div className="results__communityRankingCard">
                                        <ResultsCountryCard
                                            country={entry.participant}
                                        />
                                    </div>
                                </div>
                                {showPoints ? (
                                    <span className="results__communityRankingPoints">
                                        {isPointsAwardPhase &&
                                        latestAward?.participantCode === entry.code ? (
                                            <span
                                                className="results__communityRankingTransferSlot"
                                                ref={
                                                    registerAwardTargetRef
                                                        ? registerAwardTargetRef(entry.code)
                                                        : null
                                                }
                                                data-active={
                                                    animatedTransfer?.participantCode ===
                                                    entry.code
                                                }
                                            />
                                        ) : null}
                                        <PointsLabel
                                            points={entry.totalPoints}
                                            className={`results__communityRankingTotal${
                                                entry.code === highlightedScoreParticipantCode
                                                    ? ' results__communityRankingTotal--highlighted'
                                                    : ''
                                            }`}
                                            dataTransferPhase={
                                                entry.code === highlightedScoreParticipantCode
                                                    ? highlightedScorePhase
                                                    : null
                                            }
                                        />
                                    </span>
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}
