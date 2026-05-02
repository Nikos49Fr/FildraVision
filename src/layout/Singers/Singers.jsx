import './Singers.scss';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import { allParticipants } from './../../datas/countries';

export default function Singers() {
    return (
        <div className="main-wrapper">
            {allParticipants.map((country) => (
                <ArtistCard country={country} key={country.code} />
            ))}
        </div>
    );
}
