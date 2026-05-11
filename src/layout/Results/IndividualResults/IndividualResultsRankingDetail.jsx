import {
    formatIndividualPointsLabel,
    getIndividualPointsLabelParts,
} from './IndividualResults.helpers';
import IndividualResultsResponsiveCard from './IndividualResultsResponsiveCard';

function PointsLabel({ points }) {
    if (!points) {
        return null;
    }

    const { prefix, value, suffix } = getIndividualPointsLabelParts(points, {
        withPrefix: true,
    });

    return (
        <span className="results__individualDetailPointsLabel">
            <span className="results__pointsPrefix">{prefix}</span>
            <span className="results__pointsValue">{value}</span>{' '}
            <span className="results__pointsSuffix">{suffix}</span>
        </span>
    );
}

export default function IndividualResultsRankingDetail({
    title,
    totalScore,
    rankingBreakdown,
    avatarUrl = null,
    displayName = '',
    isCommunity = false,
    emptyMessage,
}) {
    if (!Array.isArray(rankingBreakdown) || rankingBreakdown.length === 0) {
        return <p className="results__emptyMessage">{emptyMessage}</p>;
    }

    return (
        <div className="results__individualDetail">
            <div className="results__individualDetailHeader">
                <div className="results__individualDetailIdentity">
                    {displayName ? (
                        isCommunity ? (
                            <span className="results__individualLeaderboardAvatar results__individualLeaderboardAvatar--community">
                                C
                            </span>
                        ) : avatarUrl ? (
                            <img
                                className="results__individualLeaderboardAvatar"
                                src={avatarUrl}
                                alt={`Avatar de ${displayName}`}
                            />
                        ) : (
                            <span className="results__individualLeaderboardAvatar results__individualLeaderboardAvatar--fallback">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        )
                    ) : null}
                    <h3 className="results__individualDetailTitle">{title}</h3>
                </div>
                <p className="results__individualDetailTotal">
                    {formatIndividualPointsLabel(totalScore)}
                </p>
            </div>
            <ol className="results__individualDetailList">
                {rankingBreakdown.map((entry) => (
                    <li
                        key={entry.code}
                        className="results__individualDetailItem"
                    >
                        <span className="results__individualDetailPoints">
                            <PointsLabel points={entry.totalPoints} />
                        </span>
                        <div className="results__individualDetailCard">
                            <IndividualResultsResponsiveCard country={entry.participant} />
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
