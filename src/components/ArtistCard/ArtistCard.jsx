import './ArtistCard.scss';
import MicroIcon from '../../assets/logos/microphone.svg?react';
import MusicIcon from '../../assets/logos/music.svg?react';
import { getParticipantSongUrl } from '../../utils/helpers/participants';

const flags = import.meta.glob('/src/assets/flags/*.svg', { eager: true });
const singers = import.meta.glob('/src/assets/singers/*.webp', {
    eager: true,
});

export default function ArtistCard({ country }) {
    const flag =
        flags[`/src/assets/flags/flag_${country.code.toLowerCase()}.svg`]
            ?.default;

    const singer =
        singers[`/src/assets/singers/${country.code.toLowerCase()}-singer.webp`]
            ?.default;
    const songUrl = getParticipantSongUrl(country);

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
                    {songUrl ? (
                        <a
                            className="song song--link"
                            href={songUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <MusicIcon
                                className="music-icon"
                                aria-hidden="true"
                            />
                            <div>{country.song}</div>
                        </a>
                    ) : (
                        <div className="song">
                            <MusicIcon
                                className="music-icon"
                                aria-hidden="true"
                            />
                            <div>{country.song}</div>
                        </div>
                    )}
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
