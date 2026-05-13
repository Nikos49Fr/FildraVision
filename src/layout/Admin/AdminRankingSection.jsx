import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import RankingSaveButton from '../../components/RankingSaveButton/RankingSaveButton';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';
import TierRankingBoard from '../../utils/DragAndDrop/TierRankingBoard';
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch';
import { OFFICIAL_NON_QUALIFIED_TIER_ID } from '../../utils/helpers/officialResults';

export default function AdminRankingSection({
    title,
    ranking,
    boardState,
    isQualificationResult = false,
    onRankingChange,
    onRankingSave,
    saveStatus,
    voteSwitchId,
    isVoteOpen,
    isVoteSwitchDisabled,
    onVoteAvailabilityChange,
    publicationSwitchId,
    isPublished,
    isPublicationSwitchDisabled,
    onPublicationChange,
}) {
    return (
        <article className="admin-classement">
            <header className="admin-classement__header">
                <h2 className="admin-classement__title">{title}</h2>
                <ToggleSwitch
                    className="admin-classement__voteSwitch"
                    id={voteSwitchId}
                    checked={isVoteOpen}
                    disabled={isVoteSwitchDisabled}
                    onChange={onVoteAvailabilityChange}
                />
                <ToggleSwitch
                    className="admin-classement__publicationSwitch"
                    id={publicationSwitchId}
                    checked={isPublished}
                    disabled={isPublicationSwitchDisabled}
                    actionLabelOn="Retirer la publication"
                    actionLabelOff="Publier le classement"
                    onChange={onPublicationChange}
                />
                <RankingSaveButton
                    className="admin-classement__saveButton"
                    status={saveStatus}
                    onClick={onRankingSave}
                />
            </header>
            {isQualificationResult ? (
                <TierRankingBoard
                    className="admin-classement__table admin-classement__qualificationBoard"
                    boardClassName="admin-classement__qualificationTiers"
                    sourceClassName="admin-classement__qualificationZone admin-classement__qualificationZone--qualified"
                    tierClassName="admin-classement__qualificationZone admin-classement__qualificationZone--nonQualified"
                    itemClassName="admin-classement__qualificationItem"
                    boardState={boardState}
                    tiers={[
                        {
                            id: OFFICIAL_NON_QUALIFIED_TIER_ID,
                            label: 'Pays non qualifiés',
                        },
                    ]}
                    sourceLabel="Pays qualifiés"
                    onChange={onRankingChange}
                    getItemId={(country) => country.code}
                    renderItem={(country) => <ArtistSmallCard country={country} />}
                />
            ) : (
                <DragAndDrop
                    className="admin-classement__table"
                    items={ranking}
                    onChange={onRankingChange}
                    getItemId={(country) => country.code}
                    renderItem={(country) => <ArtistSmallCard country={country} />}
                />
            )}
        </article>
    );
}
