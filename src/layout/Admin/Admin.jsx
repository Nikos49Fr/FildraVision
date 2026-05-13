import './Admin.scss';
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
import AdminRankingSection from './AdminRankingSection';

export default function Admin() {
    const {
        isLoading: isVoteAvailabilityLoading,
        isSessionOpen,
        isSessionPending,
        handleVoteAvailabilityChange,
    } = useVoteAvailability();
    const {
        ranking: semiFinal1OfficialRanking,
        boardState: semiFinal1OfficialBoardState,
        handleRankingChange: handleSemiFinal1OfficialRankingChange,
        handleRankingSave: handleSemiFinal1OfficialRankingSave,
        saveStatus: semiFinal1OfficialRankingSaveStatus,
        isPublished: isSemiFinal1OfficialRankingPublished,
        isQualificationResult: isSemiFinal1OfficialQualificationResult,
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
        boardState: semiFinal2OfficialBoardState,
        handleRankingChange: handleSemiFinal2OfficialRankingChange,
        handleRankingSave: handleSemiFinal2OfficialRankingSave,
        saveStatus: semiFinal2OfficialRankingSaveStatus,
        isPublished: isSemiFinal2OfficialRankingPublished,
        isQualificationResult: isSemiFinal2OfficialQualificationResult,
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
            <AdminRankingSection
                title="Demi-Finale 1"
                ranking={semiFinal1OfficialRanking}
                boardState={semiFinal1OfficialBoardState}
                isQualificationResult={isSemiFinal1OfficialQualificationResult}
                onRankingChange={handleSemiFinal1OfficialRankingChange}
                onRankingSave={handleSemiFinal1OfficialRankingSave}
                saveStatus={semiFinal1OfficialRankingSaveStatus}
                voteSwitchId="semi-final-1-vote-switch"
                isVoteOpen={isSessionOpen(
                    OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                )}
                isVoteSwitchDisabled={
                    isVoteAvailabilityLoading ||
                    isSessionPending(
                        OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                    )
                }
                onVoteAvailabilityChange={(nextChecked) =>
                    handleVoteAvailabilityChange(
                        OFFICIAL_RANKING_SESSIONS.semiFinal1OfficialRanking,
                        nextChecked,
                    )
                }
                publicationSwitchId="semi-final-1-publication-switch"
                isPublished={isSemiFinal1OfficialRankingPublished}
                isPublicationSwitchDisabled={
                    isSemiFinal1OfficialRankingPublicationSwitchDisabled
                }
                onPublicationChange={
                    handleSemiFinal1OfficialRankingPublicationChange
                }
            />

            <AdminRankingSection
                title="Demi-Finale 2"
                ranking={semiFinal2OfficialRanking}
                boardState={semiFinal2OfficialBoardState}
                isQualificationResult={isSemiFinal2OfficialQualificationResult}
                onRankingChange={handleSemiFinal2OfficialRankingChange}
                onRankingSave={handleSemiFinal2OfficialRankingSave}
                saveStatus={semiFinal2OfficialRankingSaveStatus}
                voteSwitchId="semi-final-2-vote-switch"
                isVoteOpen={isSessionOpen(
                    OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                )}
                isVoteSwitchDisabled={
                    isVoteAvailabilityLoading ||
                    isSessionPending(
                        OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                    )
                }
                onVoteAvailabilityChange={(nextChecked) =>
                    handleVoteAvailabilityChange(
                        OFFICIAL_RANKING_SESSIONS.semiFinal2OfficialRanking,
                        nextChecked,
                    )
                }
                publicationSwitchId="semi-final-2-publication-switch"
                isPublished={isSemiFinal2OfficialRankingPublished}
                isPublicationSwitchDisabled={
                    isSemiFinal2OfficialRankingPublicationSwitchDisabled
                }
                onPublicationChange={
                    handleSemiFinal2OfficialRankingPublicationChange
                }
            />

            <AdminRankingSection
                title="Grande Finale"
                ranking={finalOfficialRanking}
                onRankingChange={handleFinalOfficialRankingChange}
                onRankingSave={handleFinalOfficialRankingSave}
                saveStatus={finalOfficialRankingSaveStatus}
                voteSwitchId="final-vote-switch"
                isVoteOpen={isSessionOpen(
                    OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                )}
                isVoteSwitchDisabled={
                    isVoteAvailabilityLoading ||
                    isSessionPending(
                        OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                    )
                }
                onVoteAvailabilityChange={(nextChecked) =>
                    handleVoteAvailabilityChange(
                        OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
                        nextChecked,
                    )
                }
                publicationSwitchId="final-publication-switch"
                isPublished={isFinalOfficialRankingPublished}
                isPublicationSwitchDisabled={
                    isFinalOfficialRankingPublicationSwitchDisabled
                }
                onPublicationChange={handleFinalOfficialRankingPublicationChange}
            />
        </main>
    );
}
