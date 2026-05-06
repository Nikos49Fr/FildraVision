import './Admin.scss';
import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import RankingSaveButton from '../../components/RankingSaveButton/RankingSaveButton';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch';
import {
    OFFICIAL_RANKING_LOCAL_STORAGE_KEYS,
    OFFICIAL_RANKING_SESSIONS,
} from '../../utils/helpers/rankingsPersistence';
import {
    allParticipants,
    semiFinal1Participants,
    semiFinal2Participants,
    finalParticipants,
} from '../../datas/countries';
import useOfficialRanking from './useOfficialRanking';
import useVoteAvailability from './useVoteAvailability';

export default function Admin() {
    const {
        isLoading: isVoteAvailabilityLoading,
        isSessionOpen,
        isSessionPending,
        handleVoteAvailabilityChange,
    } = useVoteAvailability();
    const {
        ranking: semiFinal1OfficialRanking,
        handleRankingChange: handleSemiFinal1OfficialRankingChange,
        handleRankingSave: handleSemiFinal1OfficialRankingSave,
        saveStatus: semiFinal1OfficialRankingSaveStatus,
        isPublished: isSemiFinal1OfficialRankingPublished,
        isPublicationSwitchDisabled:
            isSemiFinal1OfficialRankingPublicationSwitchDisabled,
        handlePublicationChange:
            handleSemiFinal1OfficialRankingPublicationChange,
    } = useOfficialRanking({
        storageKey:
            OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.semiFinal1OfficialRanking,
        sessionKey: OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
        fallbackParticipantCodes: semiFinal1Participants,
        allParticipants,
    });
    const {
        ranking: semiFinal2OfficialRanking,
        handleRankingChange: handleSemiFinal2OfficialRankingChange,
        handleRankingSave: handleSemiFinal2OfficialRankingSave,
        saveStatus: semiFinal2OfficialRankingSaveStatus,
        isPublished: isSemiFinal2OfficialRankingPublished,
        isPublicationSwitchDisabled:
            isSemiFinal2OfficialRankingPublicationSwitchDisabled,
        handlePublicationChange:
            handleSemiFinal2OfficialRankingPublicationChange,
    } = useOfficialRanking({
        storageKey:
            OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.semiFinal2OfficialRanking,
        sessionKey: OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
        fallbackParticipantCodes: semiFinal2Participants,
        allParticipants,
    });
    const {
        ranking: finalOfficialRanking,
        handleRankingChange: handleFinalOfficialRankingChange,
        handleRankingSave: handleFinalOfficialRankingSave,
        saveStatus: finalOfficialRankingSaveStatus,
        isPublished: isFinalOfficialRankingPublished,
        isPublicationSwitchDisabled:
            isFinalOfficialRankingPublicationSwitchDisabled,
        handlePublicationChange: handleFinalOfficialRankingPublicationChange,
    } = useOfficialRanking({
        storageKey: OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.finalOfficialRanking,
        sessionKey: OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
        fallbackParticipantCodes: finalParticipants,
        allParticipants,
    });

    return (
        <main className="admin">
            <article className="admin-classement">
                <header className="admin-classement__header">
                    <h2 className="admin-classement__title">Demi-Finale 1</h2>
                    <ToggleSwitch
                        className="admin-classement__voteSwitch"
                        id="semi-final-1-vote-switch"
                        checked={isSessionOpen(
                            OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                        )}
                        disabled={
                            isVoteAvailabilityLoading ||
                            isSessionPending(
                                OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                            )
                        }
                        labelOn="Votes ouverts"
                        labelOff="Votes fermés"
                        onChange={(nextChecked) =>
                            handleVoteAvailabilityChange(
                                OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                                nextChecked,
                            )
                        }
                    />
                    <ToggleSwitch
                        className="admin-classement__publicationSwitch"
                        id="semi-final-1-publication-switch"
                        checked={isSemiFinal1OfficialRankingPublished}
                        disabled={
                            isSemiFinal1OfficialRankingPublicationSwitchDisabled
                        }
                        actionLabelOn="Retirer la publication"
                        actionLabelOff="Publier le classement"
                        onChange={
                            handleSemiFinal1OfficialRankingPublicationChange
                        }
                    />
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={semiFinal1OfficialRankingSaveStatus}
                        onClick={handleSemiFinal1OfficialRankingSave}
                    />
                </header>
                <DragAndDrop
                    className="admin-classement__table"
                    items={semiFinal1OfficialRanking}
                    onChange={handleSemiFinal1OfficialRankingChange}
                    getItemId={(country) => country.code}
                    renderItem={(country) => (
                        <ArtistSmallCard country={country} />
                    )}
                />
            </article>

            <article className="admin-classement">
                <header className="admin-classement__header">
                    <h2 className="admin-classement__title">Demi-Finale 2</h2>
                    <ToggleSwitch
                        className="admin-classement__voteSwitch"
                        id="semi-final-2-vote-switch"
                        checked={isSessionOpen(
                            OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                        )}
                        disabled={
                            isVoteAvailabilityLoading ||
                            isSessionPending(
                                OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                            )
                        }
                        labelOn="Votes ouverts"
                        labelOff="Votes fermés"
                        onChange={(nextChecked) =>
                            handleVoteAvailabilityChange(
                                OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                                nextChecked,
                            )
                        }
                    />
                    <ToggleSwitch
                        className="admin-classement__publicationSwitch"
                        id="semi-final-2-publication-switch"
                        checked={isSemiFinal2OfficialRankingPublished}
                        disabled={
                            isSemiFinal2OfficialRankingPublicationSwitchDisabled
                        }
                        actionLabelOn="Retirer la publication"
                        actionLabelOff="Publier le classement"
                        onChange={
                            handleSemiFinal2OfficialRankingPublicationChange
                        }
                    />
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={semiFinal2OfficialRankingSaveStatus}
                        onClick={handleSemiFinal2OfficialRankingSave}
                    />
                </header>
                <DragAndDrop
                    className="admin-classement__table"
                    items={semiFinal2OfficialRanking}
                    onChange={handleSemiFinal2OfficialRankingChange}
                    getItemId={(country) => country.code}
                    renderItem={(country) => (
                        <ArtistSmallCard country={country} />
                    )}
                />
            </article>

            <article className="admin-classement">
                <header className="admin-classement__header">
                    <h2 className="admin-classement__title">Grande Finale</h2>
                    <ToggleSwitch
                        className="admin-classement__voteSwitch"
                        id="final-vote-switch"
                        checked={isSessionOpen(
                            OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                        )}
                        disabled={
                            isVoteAvailabilityLoading ||
                            isSessionPending(
                                OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                            )
                        }
                        labelOn="Votes ouverts"
                        labelOff="Votes fermés"
                        onChange={(nextChecked) =>
                            handleVoteAvailabilityChange(
                                OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                                nextChecked,
                            )
                        }
                    />
                    <ToggleSwitch
                        className="admin-classement__publicationSwitch"
                        id="final-publication-switch"
                        checked={isFinalOfficialRankingPublished}
                        disabled={
                            isFinalOfficialRankingPublicationSwitchDisabled
                        }
                        actionLabelOn="Retirer la publication"
                        actionLabelOff="Publier le classement"
                        onChange={handleFinalOfficialRankingPublicationChange}
                    />
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={finalOfficialRankingSaveStatus}
                        onClick={handleFinalOfficialRankingSave}
                    />
                </header>
                <DragAndDrop
                    className="admin-classement__table"
                    items={finalOfficialRanking}
                    onChange={handleFinalOfficialRankingChange}
                    getItemId={(country) => country.code}
                    renderItem={(country) => (
                        <ArtistSmallCard country={country} />
                    )}
                />
            </article>
        </main>
    );
}
