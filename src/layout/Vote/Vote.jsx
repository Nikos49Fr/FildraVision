import './Vote.scss';
import {
    allParticipants,
    semiFinal1Participants,
    semiFinal2Participants,
    finalParticipants,
} from '../../datas/countries';
import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import RankingSaveButton from '../../components/RankingSaveButton/RankingSaveButton';
import useUserRanking from './useUserRanking';
import TierRankingBoard from '../../utils/DragAndDrop/TierRankingBoard';
import {
    SEMI_FINAL_1_TIER_LIST,
    USER_RANKING_SOURCE_ID,
    VOTE_SESSION_CONFIGS,
} from './Vote.helpers';
import { useProfile } from '../../context/profileContext';
import useOpenVoteSession from './useOpenVoteSession';

const FALLBACK_PARTICIPANT_CODES_BY_SESSION = {
    semi_final_1: semiFinal1Participants,
    semi_final_2: semiFinal2Participants,
    final: finalParticipants,
};

function getParticipantsList(participantCodes, participants) {
    const participantsByCode = participants.reduce((acc, participant) => {
        acc[participant.code] = participant;
        return acc;
    }, {});

    return participantCodes
        .map((code) => participantsByCode[code])
        .filter(Boolean);
}

export default function Vote() {
    const { profile, isProfileLoading } = useProfile();
    const { openSessionKey, isLoading: isOpenVoteSessionLoading } =
        useOpenVoteSession();
    const isAuthenticated = Boolean(profile);
    const activeVoteSessionConfig = openSessionKey
        ? (VOTE_SESSION_CONFIGS[openSessionKey] ?? null)
        : null;
    const fallbackParticipantCodes =
        (openSessionKey &&
            FALLBACK_PARTICIPANT_CODES_BY_SESSION[openSessionKey]) ??
        semiFinal1Participants;
    const isRankingEnabled =
        !isProfileLoading &&
        !isOpenVoteSessionLoading &&
        isAuthenticated &&
        Boolean(activeVoteSessionConfig);
    const participantsList = getParticipantsList(
        fallbackParticipantCodes,
        allParticipants,
    );

    const {
        boardState: userRankingBoardState,
        handleBoardStateChange: handleUserRankingBoardStateChange,
        handleBoardStateSave: handleUserRankingSave,
        saveStatus: userRankingSaveStatus,
    } = useUserRanking({
        storageKey:
            activeVoteSessionConfig?.storageKey ??
            VOTE_SESSION_CONFIGS.semi_final_1.storageKey,
        sessionKey:
            activeVoteSessionConfig?.sessionKey ??
            VOTE_SESSION_CONFIGS.semi_final_1.sessionKey,
        fallbackParticipantCodes,
        allParticipants,
        tiers: SEMI_FINAL_1_TIER_LIST,
        enabled: isRankingEnabled,
    });

    const title = activeVoteSessionConfig?.title ?? 'Session de vote';
    const statusLabel =
        activeVoteSessionConfig && !isOpenVoteSessionLoading
            ? isAuthenticated
                ? 'Votes ouverts'
                : 'Connecte-toi pour voter'
            : 'Votes fermés';
    const statusVariant =
        activeVoteSessionConfig && !isOpenVoteSessionLoading
            ? isAuthenticated
                ? 'open'
                : 'auth'
            : 'closed';

    return (
        <main className="vote">
            <article className="vote-classement">
                <section className="vote-classement__notice vote-classement__notice--permanent">
                    <p className="vote-classement__noticeText">
                        Les votes seront ouverts au début de chaque soirée des
                        demi finales ou de la grande finale, et pendant encore
                        quelques minutes après le passage du dernier candidat.
                    </p>
                    <p className="vote-classement__noticeText">
                        Nous découvrirons ensuite ensemble vos classements et le
                        classement communautaire.
                    </p>
                    <p className="vote-classement__noticeText">
                        Puis, dès que les résultats IRL seront connus, nous
                        pourrons regarder si vous aviez vu juste pour vos
                        classements.
                    </p>
                </section>

                <section className="vote-classement__notice">
                    <h2 className="vote-classement__noticeTitle">
                        Comment participer ?
                    </h2>
                    {isOpenVoteSessionLoading ? (
                        <p className="vote-classement__noticeText">
                            Vérification de la session de vote en cours...
                        </p>
                    ) : isProfileLoading ? (
                        <p className="vote-classement__noticeText">
                            Vérification de ta session en cours...
                        </p>
                    ) : !isAuthenticated ? (
                        <p className="vote-classement__noticeText vote-classement__noticeText--auth">
                            Connecte-toi pour classer les pays, sauvegarder ton
                            classement et le retrouver plus tard.
                        </p>
                    ) : (
                        <>
                            <p className="vote-classement__noticeText">
                                Glisse les pays dans les différents tiers pour
                                construire ton classement. L'ordre reste
                                important à l'intérieur de chaque tier.
                            </p>
                            <p className="vote-classement__noticeText">
                                Une fois ton classement sauvegardé, tu peux
                                toujours le modifier librement tant que les
                                votes sont ouverts.
                            </p>
                        </>
                    )}
                </section>

                <header className="vote-classement__header">
                    <h2 className="vote-classement__title">
                        <span>{title}</span>
                        <span
                            className="vote-classement__statusTag"
                            data-status={statusVariant}
                        >
                            {statusLabel}
                        </span>
                    </h2>
                    {isRankingEnabled ? (
                        <RankingSaveButton
                            className="vote-classement__saveButton"
                            status={userRankingSaveStatus}
                            onClick={handleUserRankingSave}
                        />
                    ) : null}
                </header>

                {isRankingEnabled ? (
                    <TierRankingBoard
                        className="vote-classement__table"
                        sourceClassName="vote-classement__source"
                        boardClassName="vote-classement__tiers"
                        tierClassName="vote-classement__tier"
                        itemClassName="vote-classement__item"
                        boardState={userRankingBoardState}
                        tiers={SEMI_FINAL_1_TIER_LIST}
                        sourceId={USER_RANKING_SOURCE_ID}
                        sourceLabel="Pays à classer"
                        allowOutsideDrag={true}
                        onChange={handleUserRankingBoardStateChange}
                        getItemId={(country) => country.code}
                        renderItem={(country) => (
                            <ArtistSmallCard country={country} />
                        )}
                    />
                ) : activeVoteSessionConfig ? (
                    <section className="vote-classement__preview">
                        <div className="vote-classement__previewHeader">
                            Participants
                        </div>
                        <div className="vote-classement__previewList">
                            {participantsList.map((country) => (
                                <div
                                    key={country.code}
                                    className="vote-classement__previewItem"
                                >
                                    <ArtistSmallCard country={country} />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}
            </article>
        </main>
    );
}
