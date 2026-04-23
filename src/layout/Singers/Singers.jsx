import './Singers.scss';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import { countries } from './../../datas/countries';

export default function Singers() {
    return (
        <div className="main-wrapper">
            {countries.map((country) => (
                <ArtistCard country={country} key={country.code} />
            ))}
        </div>
    );
}
