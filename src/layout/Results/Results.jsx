import { useEffect, useMemo, useRef, useState } from 'react';
import './Results.scss';
import { useProfile } from '../../context/profileContext';
import {
    getCommunityResult,
    getSessionUserRankings,
    publishCommunityResult,
    setCommunityResultRevealing,
} from '../../services/results';
import ResultsCommunityRankingPanel from './ResultsCommunityRankingPanel';
import ResultsSessionSelector from './ResultsSessionSelector';
import ResultsVoterRankingsCarousel from './ResultsVoterRankingsCarousel';
import ResultsVoterRevealPanel from './ResultsVoterRevealPanel';
import {
    DEFAULT_RESULTS_SESSION_KEY,
    COMMUNITY_REPLAY_PHASES,
    RESULTS_SESSION_CONFIGS,
    buildCommunityRankingReplay,
    getCommunityRankingFromSnapshot,
    getResultsSessionConfig,
    serializeCommunityRankingSnapshot,
} from './Results.helpers';
import useCommunityRankingReplay from './useCommunityRankingReplay';
import useCommunityPointsTransfer from './useCommunityPointsTransfer';

export default function Results() {
    const { profile } = useProfile();
    const [selectedSessionKey, setSelectedSessionKey] = useState(
        DEFAULT_RESULTS_SESSION_KEY,
    );
    const [communityResult, setCommunityResult] = useState(null);
    const [sessionUserRankings, setSessionUserRankings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const workspaceRef = useRef(null);
    const sessionConfig = getResultsSessionConfig(selectedSessionKey);
    const isAdmin = Boolean(profile?.is_admin);

    useEffect(() => {
        let isMounted = true;

        async function loadResults() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const [nextCommunityResult, nextSessionUserRankings] =
                    await Promise.all([
                        getCommunityResult(selectedSessionKey),
                        getSessionUserRankings(selectedSessionKey),
                    ]);

                if (!isMounted) {
                    return;
                }

                setCommunityResult(nextCommunityResult);
                setSessionUserRankings(nextSessionUserRankings);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    "Impossible de charger les resultats pour l'instant.",
                );
                console.error(error.message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadResults();

        return () => {
            isMounted = false;
        };
    }, [selectedSessionKey]);

    const replay = useMemo(
        () =>
            buildCommunityRankingReplay(
                sessionUserRankings,
                sessionConfig.participantCodes,
            ),
        [sessionConfig.participantCodes, sessionUserRankings],
    );
    const publishedCommunityRanking = useMemo(
        () =>
            communityResult?.rankingSnapshot
                ? getCommunityRankingFromSnapshot(
                      communityResult.rankingSnapshot,
                      sessionConfig.participantCodes,
                  )
                : [],
        [communityResult?.rankingSnapshot, sessionConfig.participantCodes],
    );

    async function handleRevealStart() {
        const nextCommunityResult = await setCommunityResultRevealing(
            selectedSessionKey,
            replay.voterCount,
        );

        setCommunityResult((currentCommunityResult) => ({
            ...currentCommunityResult,
            ...nextCommunityResult,
            rankingSnapshot: currentCommunityResult?.rankingSnapshot ?? null,
            publishedAt: currentCommunityResult?.publishedAt ?? null,
        }));
    }

    async function handleReplayCompleted() {
        const rankingSnapshot = serializeCommunityRankingSnapshot({
            sessionKey: selectedSessionKey,
            voterCount: replay.voterCount,
            ranking: replay.finalRanking,
        });
        const nextCommunityResult = await publishCommunityResult(
            selectedSessionKey,
            {
                voterCount: replay.voterCount,
                rankingSnapshot,
            },
        );

        setCommunityResult(nextCommunityResult);
    }

    const {
        currentStep,
        isPending,
        isPlaying,
        isCompleted,
        goToPreviousReveal,
        goToReplayEnd,
        goToReplayStart,
        togglePlayback,
        goToNextReveal,
    } = useCommunityRankingReplay({
        replay,
        sessionKey: selectedSessionKey,
        initialStatus: communityResult?.status ?? 'idle',
        enabled: isAdmin && replay.minimumVoterCountReached,
        onRevealStart: handleRevealStart,
        onReplayCompleted: handleReplayCompleted,
    });

    const adminDisplayedRanking =
        currentStep?.communityRanking ?? replay.initialRanking;
    const awardParticipantCode =
        currentStep?.latestAward?.participantCode ?? null;
    const isPointsAwardPhase =
        currentStep?.phase === COMMUNITY_REPLAY_PHASES.awardPoints;
    const sessionStatus = communityResult?.status ?? 'idle';
    const hasPublishedCommunityRanking =
        sessionStatus === 'published' && publishedCommunityRanking.length > 0;
    const {
        activeTransfer,
        registerSourceRef,
        registerTargetRef,
    } = useCommunityPointsTransfer({
        currentStep,
        workspaceRef,
    });
    const displayedCommunityRanking = useMemo(() => {
        if (currentStep?.phase !== COMMUNITY_REPLAY_PHASES.awardPoints) {
            return adminDisplayedRanking;
        }

        const deductedPoints =
            activeTransfer?.remainingPoints ??
            currentStep.latestAward?.points ??
            0;
        const targetParticipantCode =
            activeTransfer?.participantCode ??
            currentStep.latestAward?.participantCode;

        return adminDisplayedRanking.map((entry) => {
            if (entry.code !== targetParticipantCode) {
                return entry;
            }

            return {
                ...entry,
                totalPoints:
                    entry.totalPoints - deductedPoints,
            };
        });
    }, [activeTransfer, adminDisplayedRanking, currentStep]);
    const isAwardHighlightActive =
        Boolean(activeTransfer) ||
        (Boolean(awardParticipantCode) &&
            isPlaying &&
            currentStep?.phase === COMMUNITY_REPLAY_PHASES.reorderRanking);
    const highlightedParticipantCode = isAwardHighlightActive
        ? awardParticipantCode
        : null;
    const isScoreHighlightActive =
        (Boolean(awardParticipantCode) &&
            ['pre-count', 'count', 'fade-out'].includes(
                activeTransfer?.phase ?? '',
            )) ||
        (Boolean(awardParticipantCode) &&
            isPlaying &&
            currentStep?.phase === COMMUNITY_REPLAY_PHASES.reorderRanking);
    const highlightedScoreParticipantCode = isScoreHighlightActive
        ? awardParticipantCode
        : null;

    return (
        <main className="results">
            <ResultsSessionSelector
                sessionConfigs={Object.values(RESULTS_SESSION_CONFIGS)}
                selectedSessionKey={selectedSessionKey}
                onChange={setSelectedSessionKey}
            />

            {isLoading ? (
                <section className="results__messagePanel">
                    Chargement des résultats en cours...
                </section>
            ) : errorMessage ? (
                <section className="results__messagePanel">
                    {errorMessage}
                </section>
            ) : isAdmin ? (
                replay.minimumVoterCountReached ? (
                    <div className="results__workspace" ref={workspaceRef}>
                        <ResultsCommunityRankingPanel
                            title="Classement communautaire"
                            ranking={displayedCommunityRanking}
                            highlightedParticipantCode={highlightedParticipantCode}
                            highlightedScoreParticipantCode={
                                highlightedScoreParticipantCode
                            }
                            highlightedScorePhase={activeTransfer?.phase ?? null}
                            latestAward={currentStep?.latestAward ?? null}
                            animatedTransfer={activeTransfer}
                            isPointsAwardPhase={isPointsAwardPhase}
                            registerAwardTargetRef={registerTargetRef}
                            emptyMessage="Aucun point attribue pour le moment."
                        />
                        <ResultsVoterRevealPanel
                            currentStep={currentStep}
                            voterCount={replay.voterCount}
                            voters={replay.voters}
                            isPlaying={isPlaying}
                            isPending={isPending}
                            isCompleted={isCompleted}
                            onPreviousReveal={goToPreviousReveal}
                            onReplayEnd={goToReplayEnd}
                            onReplayStart={goToReplayStart}
                            onTogglePlayback={togglePlayback}
                            onNextReveal={goToNextReveal}
                            highlightedParticipantCode={highlightedParticipantCode}
                            registerAwardSourceRef={registerSourceRef}
                            isAdmin={true}
                        />
                        {activeTransfer ? (
                            <div
                                className="results__floatingPointsTag"
                                data-phase={activeTransfer.phase}
                                style={{
                                    left: `${activeTransfer.sourcePosition.x}px`,
                                    top: `${activeTransfer.sourcePosition.y}px`,
                                    '--results-transfer-x': `${activeTransfer.targetPosition.x - activeTransfer.sourcePosition.x}px`,
                                    '--results-transfer-y': `${activeTransfer.targetPosition.y - activeTransfer.sourcePosition.y}px`,
                                }}
                            >
                                +{activeTransfer.remainingPoints}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <section className="results__messagePanel">
                        Il faut au moins 2 votants valides pour établir le
                        classement communautaire.
                    </section>
                )
            ) : hasPublishedCommunityRanking ? (
                <div className="results__workspace">
                    <ResultsCommunityRankingPanel
                        title="Classement communautaire final"
                        ranking={publishedCommunityRanking}
                    />
                    <ResultsVoterRankingsCarousel voters={replay.voters} />
                </div>
            ) : sessionStatus === 'revealing' ? (
                <section className="results__messagePanel">
                    Classement communautaire en cours, rends-toi sur la chaine
                    de Fildraen pour y assister.
                </section>
            ) : (
                <section className="results__messagePanel">
                    Les résultats ne sont pas encore disponibles pour cette
                    session.
                </section>
            )}

            {!isLoading && !errorMessage ? (
                <p className="results__footnote">
                    {replay.voterCount} votant
                    {replay.voterCount > 1 ? 's' : ''} pris en compte pour cette
                    session.
                </p>
            ) : null}
        </main>
    );
}
