import './Admin.scss';
import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import RankingSaveButton from '../../components/RankingSaveButton/RankingSaveButton';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';
import useOfficialRankings from './useOfficialRankings';

export default function Admin() {
    const {
        officialRankings,
        handleOfficialRankingChange,
        handleOfficialRankingSave,
        getResolvedSaveStatus,
        officialRankingLocalStorageKeys,
        officialRankingSessions,
    } = useOfficialRankings();

    return (
        <main className="admin">
            <article className="admin-classement">
                <div className="admin-classement__header">
                    <h2 className="admin-classement__title">1re demi-finale</h2>
                    <RankingSaveButton
                        className="admin-classement__saveButton"
                        status={getResolvedSaveStatus(
                            'semiFinal1OfficialRanking',
                        )}
                        onClick={() =>
                            handleOfficialRankingSave(
                                'semiFinal1OfficialRanking',
                                officialRankingSessions.semiFinal1OfficialRanking,
                                officialRankingLocalStorageKeys.semiFinal1OfficialRanking,
                            )
                        }
                    />
                </div>
                <DragAndDrop
                    className="admin-classement__table"
                    items={officialRankings.semiFinal1OfficialRanking}
                    onChange={(nextRanking) =>
                        handleOfficialRankingChange(
                            'semiFinal1OfficialRanking',
                            officialRankingLocalStorageKeys.semiFinal1OfficialRanking,
                            nextRanking,
                        )
                    }
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
                        status={getResolvedSaveStatus(
                            'semiFinal2OfficialRanking',
                        )}
                        onClick={() =>
                            handleOfficialRankingSave(
                                'semiFinal2OfficialRanking',
                                officialRankingSessions.semiFinal2OfficialRanking,
                                officialRankingLocalStorageKeys.semiFinal2OfficialRanking,
                            )
                        }
                    />
                </div>
                <DragAndDrop
                    className="admin-classement__table"
                    items={officialRankings.semiFinal2OfficialRanking}
                    onChange={(nextRanking) =>
                        handleOfficialRankingChange(
                            'semiFinal2OfficialRanking',
                            officialRankingLocalStorageKeys.semiFinal2OfficialRanking,
                            nextRanking,
                        )
                    }
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
                        status={getResolvedSaveStatus('finalOfficialRanking')}
                        onClick={() =>
                            handleOfficialRankingSave(
                                'finalOfficialRanking',
                                officialRankingSessions.finalOfficialRanking,
                                officialRankingLocalStorageKeys.finalOfficialRanking,
                            )
                        }
                    />
                </div>
                <DragAndDrop
                    className="admin-classement__table"
                    items={officialRankings.finalOfficialRanking}
                    onChange={(nextRanking) =>
                        handleOfficialRankingChange(
                            'finalOfficialRanking',
                            officialRankingLocalStorageKeys.finalOfficialRanking,
                            nextRanking,
                        )
                    }
                    getItemId={(country) => country.code}
                    renderItem={(country) => (
                        <ArtistSmallCard country={country} />
                    )}
                />
            </article>
        </main>
    );
}
