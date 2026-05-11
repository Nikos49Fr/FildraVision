import BackwardFastIcon from '../../../assets/logos/backward-fast-solid-full.svg?react';
import BackwardStepIcon from '../../../assets/logos/backward-step-solid-full.svg?react';
import ForwardFastIcon from '../../../assets/logos/forward-fast-solid-full.svg?react';
import ForwardStepIcon from '../../../assets/logos/forward-step-solid-full.svg?react';
import PauseIcon from '../../../assets/logos/pause-solid-full.svg?react';
import PlayIcon from '../../../assets/logos/play-solid-full.svg?react';
import QuestionIcon from '../../../assets/logos/question-solid-full.svg?react';
import ResultsCountryCard from '../../../components/ResultsCountryCard/ResultsCountryCard';
import ToggleSwitch from '../../../components/ToggleSwitch/ToggleSwitch';
import {
    COMMUNITY_REPLAY_ANIMATION_DURATIONS,
    COMMUNITY_REPLAY_PHASES,
    EUROVISION_POINTS_BY_POSITION,
    getCommunityPointsLabelParts,
    getQuestionRevealDuration,
} from './CommunityResults.helpers';
import useFlipListAnimation from './useFlipListAnimation';

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

function ControlButton({
    label,
    Icon,
    onClick,
    disabled = false,
    primary = false,
    state = null,
}) {
    return (
        <button
            type="button"
            className={`results__controlButton${primary ? ' results__controlButton--primary' : ''}`}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            data-state={state}
        >
            <Icon aria-hidden="true" />
        </button>
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

export default function ResultsVoterRevealPanel({
    currentStep,
    voterCount,
    voters = [],
    isPlaying,
    isPending,
    isCompleted,
    onPreviousReveal,
    onReplayEnd,
    onReplayStart,
    onTogglePlayback,
    onNextReveal,
    onPublish,
    canPublish = false,
    isPublished = false,
    highlightedParticipantCode = null,
    registerAwardSourceRef = null,
    isAdmin = false,
}) {
    const voter = currentStep?.voter ?? null;
    const voterNumber =
        currentStep?.voterIndex >= 0 ? currentStep.voterIndex + 1 : 0;
    const revealStatusLabel = isPlaying ? 'En lecture' : 'En pause';
    const currentPhase = currentStep?.phase ?? null;
    const isIntroPhase = currentPhase === COMMUNITY_REPLAY_PHASES.intro;
    const isOutroPhase = currentPhase === COMMUNITY_REPLAY_PHASES.outro;
    const isQuestionPhase =
        currentPhase === COMMUNITY_REPLAY_PHASES.questionEntry;
    const publishSwitchLocked = !isPublished && (isPending || !canPublish);
    const { registerItemRef } = useFlipListAnimation(
        currentStep?.revealedRanking ?? [],
        (participant) => participant.code,
        {
            duration: getQuestionRevealDuration(
                COMMUNITY_REPLAY_ANIMATION_DURATIONS,
            ),
        },
    );

    return (
        <section className="results__panel results__panel--reveal">
            <header className="results__panelHeader">
                <h2 className="results__panelTitle">Reveal des votes</h2>
                {!isAdmin ? (
                    <span className="results__informativeStatus">
                        {revealStatusLabel}
                    </span>
                ) : null}
            </header>

            {isAdmin ? (
                <div className="results__controlsRow">
                    <div className="results__controls">
                        <ControlButton
                            label="Aller au début du reveal"
                            Icon={BackwardFastIcon}
                            onClick={onReplayStart}
                            disabled={isPending || isIntroPhase}
                        />
                        <ControlButton
                            label="Pays précédent"
                            Icon={BackwardStepIcon}
                            onClick={onPreviousReveal}
                            disabled={isPending || isIntroPhase}
                        />
                        <ControlButton
                            label={
                                isPlaying
                                    ? 'Mettre en pause'
                                    : 'Lancer la lecture'
                            }
                            Icon={isPlaying ? PauseIcon : PlayIcon}
                            onClick={onTogglePlayback}
                            disabled={isPending || isCompleted}
                            primary={true}
                            state={isPlaying ? 'playing' : 'paused'}
                        />
                        <ControlButton
                            label="Pays suivant"
                            Icon={ForwardStepIcon}
                            onClick={onNextReveal}
                            disabled={isPending || isCompleted}
                        />
                        <ControlButton
                            label="Aller à la fin du reveal"
                            Icon={ForwardFastIcon}
                            onClick={onReplayEnd}
                            disabled={isPending || isCompleted}
                        />
                    </div>
                    <div className="results__publishControl">
                        <ToggleSwitch
                            id="results-publish-switch"
                            className="results__publishSwitch"
                            checked={isPublished}
                            disabled={false}
                            inactive={publishSwitchLocked}
                            onChange={() => {
                                if (publishSwitchLocked) {
                                    return;
                                }

                                onPublish?.();
                            }}
                            actionLabelOn="Publié"
                            actionLabelOff="Publié"
                        />
                    </div>
                </div>
            ) : null}

            {isIntroPhase ? (
                <div className="results__revealPhase results__revealPhase--intro">
                    <p className="results__revealPhaseKicker">
                        Reveal en attente de lancement
                    </p>
                    <p className="results__revealPhaseText">
                        {voterCount} votant{voterCount > 1 ? 's' : ''} seront
                        révélés pour cette session.
                    </p>
                </div>
            ) : isOutroPhase ? (
                <div className="results__revealPhase results__revealPhase--outro">
                    <p className="results__revealPhaseKicker">Reveal terminé</p>
                    <p className="results__revealPhaseText">
                        Merci aux {voterCount} votants pour votre participation
                        et votre contribution au classement communautaire.
                    </p>
                    {voters.length > 0 ? (
                        <ul
                            className="results__votersList"
                            data-many-voters={voters.length > 12}
                        >
                            {voters.map((currentVoter) => (
                                <li
                                    key={currentVoter.userId}
                                    className="results__votersListItem"
                                >
                                    <VoterAvatar
                                        avatarUrl={currentVoter.avatarUrl}
                                        displayName={currentVoter.displayName}
                                    />
                                    <span className="results__votersListName">
                                        {currentVoter.displayName}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : voter ? (
                <>
                    <div className="results__voterMeta">
                        <p className="results__voterCounter">
                            Votant {voterNumber} /{' '}
                            {currentStep?.voterCount ?? voterCount}
                        </p>
                        <div className="results__voterIdentity">
                            <VoterAvatar
                                avatarUrl={voter.avatarUrl}
                                displayName={voter.displayName}
                            />
                            <span className="results__voterName">
                                {voter.displayName}
                            </span>
                        </div>
                    </div>

                    <ol className="results__revealedRankingList">
                        {currentStep.revealedRanking.map((participant, index) => {
                            const latestAward =
                                currentStep.latestAward?.participantCode ===
                                participant.code;
                            const topTenCount =
                                voter?.topTenRanking?.length ??
                                EUROVISION_POINTS_BY_POSITION.length;
                            const revealedRankingStartIndex =
                                topTenCount -
                                currentStep.revealedRanking.length;
                            const rankingPosition =
                                revealedRankingStartIndex + index + 1;
                            const revealedPoints =
                                EUROVISION_POINTS_BY_POSITION[
                                    rankingPosition - 1
                                ] ?? 0;

                            return (
                                <li
                                    key={`${participant.code}-${index}`}
                                    ref={registerItemRef(participant.code)}
                                    className="results__revealedRankingItem"
                                    data-latest-award={latestAward}
                                    data-phase={currentStep.phase}
                                >
                                    <div className="results__revealedRankingCard">
                                        {isQuestionPhase && latestAward ? (
                                            <div className="results__mysteryReveal">
                                                <div className="results__mysteryRevealSizer">
                                                    <ResultsCountryCard
                                                        country={participant}
                                                    />
                                                </div>
                                                <div className="results__mysteryRevealQuestion">
                                                    <QuestionIcon
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div className="results__mysteryRevealCountry">
                                                    <ResultsCountryCard
                                                        country={participant}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <ResultsCountryCard
                                                country={participant}
                                            />
                                        )}
                                    </div>
                                    <span
                                        className={`results__revealedRankingPoints${
                                            participant.code ===
                                            highlightedParticipantCode
                                                ? ' results__revealedRankingPoints--highlighted'
                                                : ''
                                        }`}
                                        ref={
                                            latestAward &&
                                            registerAwardSourceRef
                                                ? registerAwardSourceRef(
                                                      participant.code,
                                                  )
                                                : null
                                        }
                                    >
                                        <PointsLabel points={revealedPoints} />
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </>
            ) : (
                <p className="results__emptyMessage">
                    Aucun reveal disponible pour cette session.
                </p>
            )}
        </section>
    );
}
