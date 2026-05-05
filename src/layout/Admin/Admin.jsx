import './Admin.scss';
import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import RankingSaveButton from '../../components/RankingSaveButton/RankingSaveButton';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';
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

export default function Admin() {
    const {
        ranking: semiFinal1OfficialRanking,
        handleRankingChange: handleSemiFinal1OfficialRankingChange,
        handleRankingSave: handleSemiFinal1OfficialRankingSave,
        getResolvedSaveStatus: getSemiFinal1OfficialRankingSaveStatus,
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
        getResolvedSaveStatus: getSemiFinal2OfficialRankingSaveStatus,
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
        getResolvedSaveStatus: getFinalOfficialRankingSaveStatus,
    } = useOfficialRanking({
        storageKey: OFFICIAL_RANKING_LOCAL_STORAGE_KEYS.finalOfficialRanking,
        sessionKey: OFFICIAL_RANKING_SESSIONS.finalOfficialRanking,
        fallbackParticipantCodes: finalParticipants,
        allParticipants,
    });

    return (
        <main className="admin">
            <article className="admin-classement">
                <div className="admin-classement__header">
                    <h2 className="admin-classement__title">1re demi-finale</h2>
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={getSemiFinal1OfficialRankingSaveStatus()}
                        onClick={handleSemiFinal1OfficialRankingSave}
                    />
                </div>
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
                <div className="admin-classement__header">
                    <h2 className="admin-classement__title">2e demi-finale</h2>
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={getSemiFinal2OfficialRankingSaveStatus()}
                        onClick={handleSemiFinal2OfficialRankingSave}
                    />
                </div>
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
                <div className="admin-classement__header">
                    <h2 className="admin-classement__title">Finale</h2>
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={getFinalOfficialRankingSaveStatus()}
                        onClick={handleFinalOfficialRankingSave}
                    />
                </div>
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
