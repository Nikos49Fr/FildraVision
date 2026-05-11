import {
    formatIndividualPointsLabel,
    INDIVIDUAL_RESULTS_VIEW_KEYS,
} from './IndividualResults.helpers';

function VoterAvatar({ entry }) {
    if (entry.isCommunity) {
        return (
            <span className="results__individualLeaderboardAvatar results__individualLeaderboardAvatar--community">
                C
            </span>
        );
    }

    if (entry.avatarUrl) {
        return (
            <img
                className="results__individualLeaderboardAvatar"
                src={entry.avatarUrl}
                alt={`Avatar de ${entry.displayName}`}
            />
        );
    }

    return (
        <span className="results__individualLeaderboardAvatar results__individualLeaderboardAvatar--fallback">
            {entry.displayName?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
    );
}

export default function IndividualResultsLeaderboard({
    entries,
    onSelectCommunity,
    onSelectVoter,
}) {
    if (entries.length === 0) {
        return (
            <p className="results__emptyMessage">
                Aucun classement disponible pour établir le podium.
            </p>
        );
    }

    return (
        <ol className="results__individualLeaderboardList">
            {entries.map((entry) => (
                <li
                    key={entry.id}
                    className={`results__individualLeaderboardItem${
                        entry.isCommunity
                            ? ' results__individualLeaderboardItem--community'
                            : ''
                    }`}
                >
                    <button
                        type="button"
                        className="results__individualLeaderboardButton"
                        onClick={() => {
                            if (entry.type === INDIVIDUAL_RESULTS_VIEW_KEYS.community) {
                                onSelectCommunity?.();
                                return;
                            }

                            onSelectVoter?.(entry.id);
                        }}
                    >
                        <span className="results__individualLeaderboardPosition">
                            {entry.position}
                        </span>
                        <span className="results__individualLeaderboardIdentity">
                            <VoterAvatar entry={entry} />
                            <span className="results__individualLeaderboardName">
                                {entry.displayName}
                            </span>
                        </span>
                        <span className="results__individualLeaderboardScore">
                            {formatIndividualPointsLabel(entry.totalScore)}
                        </span>
                    </button>
                </li>
            ))}
        </ol>
    );
}
