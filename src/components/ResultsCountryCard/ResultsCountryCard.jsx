import './ResultsCountryCard.scss';

const flags = import.meta.glob('/src/assets/flags/*.svg', { eager: true });

export default function ResultsCountryCard({ country }) {
    const flag =
        flags[`/src/assets/flags/flag_${country.code.toLowerCase()}.svg`]
            ?.default;

    return (
        <article className="resultsCountryCard">
            <div className="resultsCountryCard__wrapper">
                <div className="resultsCountryCard__country">
                    <img
                        className="resultsCountryCard__flag"
                        src={flag}
                        alt={`Drapeau du pays ${country.name}`}
                    />
                    <span className="resultsCountryCard__name">
                        {country.name}
                    </span>
                </div>
            </div>
        </article>
    );
}
