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
import { OFFICIAL_RESULT_TYPES } from '../../../utils/helpers/officialResults';

const QUALIFIED_LABEL = 'Qualifi\u00e9';
const QUALIFIED_COUNTRIES_TITLE = 'Pays qualifi\u00e9s';
const NON_QUALIFIED_COUNTRIES_TITLE = 'Pays non qualifi\u00e9s';
const QUALIFICATION_WAITING_MESSAGE =
    'Le concours individuel appara\u00eetra une fois que nous conna\u00eetrons les 10 pays qualifi\u00e9s.';
const OFFICIAL_RANKING_WAITING_MESSAGE =
    'Le concours individuel appara\u00eetra une fois le classement officiel publi\u00e9.';
const COMMUNITY_WAITING_MESSAGE =
    'Le classement communautaire n\u2019appara\u00eetra ici qu\u2019apr\u00e8s sa publication.';
const VOTER_WAITING_MESSAGE =
    'Choisis un votant pour afficher son d\u00e9tail.';
const EMPTY_DETAIL_MESSAGE =
    'Aucun d\u00e9tail disponible pour ce classement.';
const LOADING_MESSAGE = 'Chargement des r\u00e9sultats en cours...';
const LOAD_ERROR_MESSAGE =
    'Impossible de charger le concours individuel pour l\u2019instant.';

function OfficialRankingPanel({
    ranking,
    isPublished,
    officialResultType,
    qualifiedParticipantCodes,
}) {
    const qualifiedCodes = new Set(qualifiedParticipantCodes);
    const isQualificationResult =
        officialResultType === OFFICIAL_RESULT_TYPES.qualification;
    const showOfficialHeader = !(isPublished && isQualificationResult);
    const showOfficialPositions = isPublished && !isQualificationResult;
    const qualifiedRanking = ranking.filter((participant) =>
        qualifiedCodes.has(participant.code),
    );
    const nonQualifiedRanking = ranking.filter(
        (participant) => !qualifiedCodes.has(participant.code),
    );

    function renderOfficialList(participants) {
        return (
            <ol className="results__individualOfficialList">
                {participants.map((participant, index) => (
                    <li
                        key={participant.code}
                        className={`results__individualOfficialItem${
                            !showOfficialPositions
                                ? ' results__individualOfficialItem--noPosition'
                                : ''
                        }`}
                    >
                        {showOfficialPositions ? (
                            <span className="results__individualOfficialPosition">
                                {index + 1}
                            </span>
                        ) : null}
                        <div className="results__individualOfficialCard">
                            {isPublished &&
                            isQualificationResult &&
                            qualifiedCodes.has(participant.code) ? (
                                <span className="results__individualOfficialBadge">
                                    {QUALIFIED_LABEL}
                                </span>
                            ) : null}
                            <IndividualResultsResponsiveCard country={participant} />
                        </div>
                    </li>
                ))}
            </ol>
        );
    }

    return (
        <section className="results__panel results__individualOfficialPanel">
            {showOfficialHeader ? (
                <header className="results__panelHeader results__individualOfficialHeader">
                    <h2 className="results__panelTitle">
                        {isPublished ? 'Classement officiel' : 'Liste des participants'}
                    </h2>
                </header>
            ) : null}
            {isPublished && isQualificationResult ? (
                <div className="results__individualOfficialGroups">
                    <section className="results__individualOfficialGroup">
                        <h2 className="results__panelTitle results__individualOfficialGroupTitle">
                            {QUALIFIED_COUNTRIES_TITLE}
                        </h2>
                        {renderOfficialList(qualifiedRanking)}
                    </section>
                    <section className="results__individualOfficialGroup">
                        <h2 className="results__panelTitle results__individualOfficialGroupTitle">
                            {NON_QUALIFIED_COUNTRIES_TITLE}
                        </h2>
                        {renderOfficialList(nonQualifiedRanking)}
                    </section>
                </div>
            ) : (
                renderOfficialList(ranking)
            )}
        </section>
    );
}

function IndividualResultsPanel({
    isOfficialRankingPublished,
    officialResultType,
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
                        {officialResultType === OFFICIAL_RESULT_TYPES.qualification
                            ? QUALIFICATION_WAITING_MESSAGE
                            : OFFICIAL_RANKING_WAITING_MESSAGE}
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
            <p className="results__emptyMessage">{COMMUNITY_WAITING_MESSAGE}</p>
        );
    } else if (
        selectedViewKey === INDIVIDUAL_RESULTS_VIEW_KEYS.voter &&
        !selectedVoterId
    ) {
        panelContent = (
            <p className="results__emptyMessage">{VOTER_WAITING_MESSAGE}</p>
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
                emptyMessage={EMPTY_DETAIL_MESSAGE}
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

                setErrorMessage(LOAD_ERROR_MESSAGE);
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
        qualifiedParticipantCodes,
        officialResultType,
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

        if (
            !selectedVoterId ||
            !voters.some((voter) => voter.userId === selectedVoterId)
        ) {
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
            <section className="results__messagePanel">{LOADING_MESSAGE}</section>
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
                officialResultType={officialResultType}
                qualifiedParticipantCodes={qualifiedParticipantCodes}
            />
            <IndividualResultsPanel
                isOfficialRankingPublished={isOfficialRankingPublished}
                officialResultType={officialResultType}
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
