import './Vote.scss';
import {
    allParticipants,
    semiFinal1Participants,
} from './../../datas/countries';
import ArtistSmallCard from '../../components/ArtistSmallCard/ArtistSmallCard';
import DragAndDrop from '../../utils/DragAndDrop/DragAndDrop';

export default function Vote() {
    const semiFinal1UserRanking = semiFinal1Participants.map(
        (participantCode) =>
            allParticipants.find((country) => country.code === participantCode),
    );

    return (
        <>
            <div className="gradient-div">
                <div className="gradient-div__origin">Gradient origine</div>
                <div className="gradient-div__gradOne">Gradient 1</div>
                <div className="gradient-div__gradTwo">Gradient 2</div>
                <div className="gradient-div__gradThree">Gradient 3</div>
            </div>

            <DragAndDrop
                items={semiFinal1UserRanking}
                getItemId={(country) => country.code}
                renderItem={(country) => <ArtistSmallCard country={country} />}
            />
        </>
    );
}
