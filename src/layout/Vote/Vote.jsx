import './Vote.scss';
import {
    allParticipants,
    semiFinal1Participants,
} from './../../datas/countries';
import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';
import CloudSaved from '../../assets/logos/cloud-check-saved.svg?react';
import CloudSynchro from '../../assets/logos/cloud-arrow-rotate-synchro.svg?react';
import CloudError from '../../assets/logos/cloud-xmark-error.svg?react';
import CloudUpdate from '../../assets/logos/cloud-arrow-up-update.svg?react';


export default function Vote() {
    const semiFinal1UserRanking = semiFinal1Participants.map(
        (participantCode) =>
            allParticipants.find((country) => country.code === participantCode),
    );

    return (
        <>
            <div className="icon-test">
                <CloudSaved className="cloud-saved"/>
                <CloudSynchro className="cloud-synchro"/>
                <CloudError className="cloud-error"/>
                <CloudUpdate className="cloud-update"/>
            </div>

            <DragAndDrop
                items={semiFinal1UserRanking}
                getItemId={(country) => country.code}
                renderItem={(country) => <ArtistSmallCard country={country} />}
            />
        </>
    );
}
