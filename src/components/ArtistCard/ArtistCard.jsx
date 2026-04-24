import './ArtistCard.scss';
import MicroIcon from '../../assets/logos/microphone.svg?react';
import MusicIcon from '../../assets/logos/music.svg?react';

export default function ArtistCard({ country }) {
    const flags = import.meta.glob('/src/assets/flags/*.svg', { eager: true });
    const singers = import.meta.glob('/src/assets/singers/*.webp', {
        eager: true,
    });

    const flag =
        flags[`/src/assets/flags/flag_${country.code.toLowerCase()}.svg`]
            ?.default;

    const singer =
        singers[`/src/assets/singers/${country.code.toLowerCase()}-singer.webp`]
            ?.default;

    return (
        <article className="artistCard">
            <div className="wrapper">
                <div className="artistCard__singer">
                    <img
                        src={singer}
                        alt={`Photo de l'artiste ${country.artist}`}
                    />
                </div>
                <div className="artistCard__content">
                    <div className="artist">
                        {/* <MicroIcon className="micro-icon"/> */}
                        <div>{country.artist}</div>
                    </div>
                    <div className="song">
                        <MusicIcon className="music-icon" aria-hidden="true" />
                        <div>{country.song}</div>
                    </div>
                    <div className="country">
                        <img
                            className="flag-icon"
                            src={flag}
                            alt={`Drapeau du pays ${country.name}`}
                        />
                        <div>{country.name}</div>
                    </div>
                </div>
            </div>
        </article>
    );
}
