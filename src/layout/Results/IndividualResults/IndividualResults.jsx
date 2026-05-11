import { useEffect, useMemo, useState } from 'react';
import './IndividualResults.scss';
import { getCurrentUser } from '../../../services/auth';
import { getOfficialRankingState } from '../../../services/officialRankings';
import {
    getCommunityResult,
    getSessionUserRankings,
} from '../../../services/results';
import IndividualResultsLeaderboard from './IndividualResultsLeaderboard';
import IndividualResultsRankingDetail from './IndividualResultsRankingDetail';
import IndividualResultsResponsiveCard from './IndividualResultsResponsiveCard';
import IndividualResultsViewSelector from './IndividualResultsViewSelector';
import {
    getIndividualResultsState,
    INDIVIDUAL_RESULTS_VIEW_KEYS,
} from './IndividualResults.helpers';

function OfficialRankingPanel({ ranking, isPublished }) {
    const title = isPublished
        ? 'Classement officiel'
        : 'Liste des participants';

    return (
        <section className="results__panel results__individualOfficialPanel">
            <header className="results__panelHeader results__individualOfficialHeader">
                <h2 className="results__panelTitle">{title}</h2>
            </header>
            <ol className="results__individualOfficialList">
                {ranking.map((participant, index) => (
                    <li
                        key={participant.code}
                        className={`results__individualOfficialItem${
                            !isPublished
                                ? ' results__individualOfficialItem--noPosition'
                                : ''
                        }`}
                    >
                        {isPublished ? (
                            <span className="results__individualOfficialPosition">
                                {index + 1}
                            </span>
                        ) : null}
                        <div className="results__individualOfficialCard">
                            <IndividualResultsResponsiveCard country={participant} />
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function IndividualResultsPanel({
    isOfficialRankingPublished,
    isCommunityRankingPublished,
    voters,
    leaderboard,
    selectedViewKey,
    selectedVoterId,
    selectedVoter,
    onSelectView,
    onSelectCommunity,
    onSelectVoter,
    onPreviousVoter,
    onNextVoter,
}) {
    if (!isOfficialRankingPublished) {
        return (
            <section className="results__panel">
                <header className="results__panelHeader">
                    <h2 className="results__panelTitle">Concours individuel</h2>
                </header>
                <div className="results__individualPlaceholder">
                    <p className="results__individualPlaceholderText">
                        Le concours individuel apparaîtra une fois le classement
                        officiel publié.
                    </p>
                </div>
            </section>
        );
    }

    const communityEntry = leaderboard.find((entry) => entry.isCommunity);
    const voterEntry = leaderboard.find(
        (entry) =>
            entry.id === (selectedVoterId || selectedVoter?.userId) &&
            !entry.isCommunity,
    );
    const selectedDetailEntry =
        selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.community
            ? communityEntry
            : voterEntry;

    let panelContent = null;

    if (selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.podium) {
        panelContent = (
            <IndividualResultsLeaderboard
                entries={leaderboard}
                onSelectCommunity={onSelectCommunity}
                onSelectVoter={onSelectVoter}
            />
        );
    } else if (
        selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.community &&
        !isCommunityRankingPublished
    ) {
        panelContent = (
            <p className="results__emptyMessage">
                Le classement communautaire n&apos;apparaîtra ici qu&apos;après sa
                publication.
            </p>
        );
    } else if (
        selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.voter &&
        !selectedVoterId
    ) {
        panelContent = (
            <p className="results__emptyMessage">
                Choisis un votant pour afficher son détail.
            </p>
        );
    } else {
        panelContent = (
            <IndividualResultsRankingDetail
                title={
                    selectedDetailEntry?.isCommunity
                        ? 'Classement communautaire'
                        : selectedDetailEntry?.displayName ?? 'Concours individuel'
                }
                totalScore={selectedDetailEntry?.totalScore ?? 0}
                rankingBreakdown={selectedDetailEntry?.rankingBreakdown ?? []}
                avatarUrl={selectedDetailEntry?.avatarUrl ?? null}
                displayName={
                    selectedDetailEntry?.isCommunity
                        ? 'Classement communautaire'
                        : selectedDetailEntry?.displayName ?? ''
                }
                isCommunity={selectedDetailEntry?.isCommunity ?? false}
                emptyMessage="Aucun détail disponible pour ce classement."
            />
        );
    }

    return (
        <section className="results__panel">
            <header className="results__panelHeader">
                <h2 className="results__panelTitle">Concours individuel</h2>
                <IndividualResultsViewSelector
                    selectedViewKey={selectedViewKey}
                    selectedVoter={selectedVoter}
                    hasVoters={voters.length > 0}
                    onViewChange={onSelectView}
                    onPreviousVoter={onPreviousVoter}
                    onNextVoter={onNextVoter}
                    onSelectCurrentVoter={() => {
                        if (selectedVoterId) {
                            onSelectVoter(selectedVoterId);
                        }
                    }}
                />
            </header>
            {panelContent}
        </section>
    );
}

export default function IndividualResults({ selectedSessionKey }) {
    const [officialRankingState, setOfficialRankingState] = useState(null);
    const [communityResult, setCommunityResult] = useState(null);
    const [userRankings, setUserRankings] = useState([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [selectedViewKey, setSelectedViewKey] = useState(
        INDIVIDUAL_RESULTS_VIEW_KEYS.podium,
    );
    const [selectedVoterId, setSelectedVoterId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setSelectedViewKey(INDIVIDUAL_RESULTS_VIEW_KEYS.podium);
        setSelectedVoterId('');
    }, [selectedSessionKey]);

    useEffect(() => {
        let isMounted = true;

        async function loadIndividualResultsData() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const [
                    nextOfficialRankingState,
                    nextCommunityResult,
                    nextUserRankings,
                    currentUser,
                ] = await Promise.all([
                    getOfficialRankingState(selectedSessionKey),
                    getCommunityResult(selectedSessionKey),
                    getSessionUserRankings(selectedSessionKey),
                    getCurrentUser().catch(() => null),
                ]);

                if (!isMounted) {
                    return;
                }

                setOfficialRankingState(nextOfficialRankingState);
                setCommunityResult(nextCommunityResult);
                setUserRankings(nextUserRankings);
                setCurrentUserId(currentUser?.id ?? '');
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    "Impossible de charger le concours individuel pour l'instant.",
                );
                console.error(error.message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadIndividualResultsData();

        return () => {
            isMounted = false;
        };
    }, [selectedSessionKey]);

    const {
        officialRanking,
        voters,
        leaderboard,
        isOfficialRankingPublished,
        isCommunityRankingPublished,
    } = useMemo(
        () =>
            getIndividualResultsState({
                officialRankingState,
                communityResult,
                sessionKey: selectedSessionKey,
                userRankings,
            }),
        [communityResult, officialRankingState, selectedSessionKey, userRankings],
    );

    const preferredVoterId = useMemo(() => {
        if (voters.length === 0) {
            return '';
        }

        const currentUserVoter = voters.find(
            (voter) => voter.userId === currentUserId,
        );

        if (currentUserVoter) {
            return currentUserVoter.userId;
        }

        return voters[0].userId;
    }, [currentUserId, voters]);

    const selectedVoter =
        voters.find((voter) => voter.userId === selectedVoterId) ?? null;
    const displayedVoter =
        selectedVoter ??
        voters.find((voter) => voter.userId === preferredVoterId) ??
        null;

    useEffect(() => {
        if (!preferredVoterId) {
            if (selectedVoterId) {
                setSelectedVoterId('');
            }

            if (selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.voter) {
                setSelectedViewKey(INDIVIDUAL_RESULTS_VIEW_KEYS.podium);
            }

            return;
        }

        if (!selectedVoterId || !voters.some((voter) => voter.userId === selectedVoterId)) {
            setSelectedVoterId(preferredVoterId);
        }
    }, [preferredVoterId, selectedViewKey, selectedVoterId, voters]);

    function cycleVoter(direction) {
        if (voters.length === 0) {
            return;
        }

        const activeVoterId = selectedVoterId || preferredVoterId;
        const currentIndex = voters.findIndex(
            (voter) => voter.userId === activeVoterId,
        );
        const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex =
            (safeCurrentIndex + direction + voters.length) % voters.length;

        setSelectedVoterId(voters[nextIndex].userId);
        setSelectedViewKey(INDIVIDUAL_RESULTS_VIEW_KEYS.voter);
    }

    if (isLoading) {
        return (
            <section className="results__messagePanel">
                Chargement des résultats en cours...
            </section>
        );
    }

    if (errorMessage) {
        return (
            <section className="results__messagePanel">{errorMessage}</section>
        );
    }

    return (
        <div className="results__individualWorkspace">
            <OfficialRankingPanel
                ranking={officialRanking}
                isPublished={isOfficialRankingPublished}
            />
            <IndividualResultsPanel
                isOfficialRankingPublished={isOfficialRankingPublished}
                isCommunityRankingPublished={isCommunityRankingPublished}
                voters={voters}
                leaderboard={leaderboard}
                selectedViewKey={selectedViewKey}
                selectedVoterId={selectedVoterId}
                selectedVoter={displayedVoter}
                onSelectView={setSelectedViewKey}
                onSelectCommunity={() => {
                    setSelectedViewKey(INDIVIDUAL_RESULTS_VIEW_KEYS.community);
                }}
                onSelectVoter={(voterId) => {
                    setSelectedViewKey(INDIVIDUAL_RESULTS_VIEW_KEYS.voter);
                    setSelectedVoterId(voterId);
                }}
                onPreviousVoter={() => cycleVoter(-1)}
                onNextVoter={() => cycleVoter(1)}
            />
        </div>
    );
}
