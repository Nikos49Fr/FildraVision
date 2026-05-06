import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import RankingSaveButton from '../../components/RankingSaveButton/RankingSaveButton';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch';

export default function AdminRankingSection({
    title,
    ranking,
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
            <DragAndDrop
                className="admin-classement__table"
                items={ranking}
                onChange={onRankingChange}
                getItemId={(country) => country.code}
                renderItem={(country) => <ArtistSmallCard country={country} />}
            />
        </article>
    );
}
