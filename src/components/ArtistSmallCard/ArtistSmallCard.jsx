import './ArtistSmallCard.scss';
import MicroIcon from '../../assets/logos/microphone.svg?react';
import MusicIcon from '../../assets/logos/music.svg?react';

const flags = import.meta.glob('/src/assets/flags/*.svg', { eager: true });

export default function ArtistSmallCard({ country }) {
    const flag =
        flags[`/src/assets/flags/flag_${country.code.toLowerCase()}.svg`]
            ?.default;

    return (
        <article className="smallCard">
            <div className="smallCard__wrapper">
                <div className="smallCard__country">
                    <img
                        className="flag-icon icon"
                        src={flag}
                        alt={`Drapeau du pays ${country.name}`}
                    />
                    <span>{country.name}</span>
                </div>
                <div className="smallCard__artist">
                    <MicroIcon className="micro-icon icon" aria-hidden="true" />
                    <span>{country.artist}</span>
                </div>
                <div className="smallCard__song">
                    <MusicIcon className="music-icon icon" aria-hidden="true" />
                    <span>{country.song}</span>
                </div>
            </div>
        </article>
    );
}
