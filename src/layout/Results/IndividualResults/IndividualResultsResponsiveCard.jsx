import ArtistSmallCard from '../../../components/ArtistSmallCard/ArtistSmallCard';
import ResultsCountryCard from '../../../components/ResultsCountryCard/ResultsCountryCard';

export default function IndividualResultsResponsiveCard({ country }) {
    return (
        <>
            <div className="results__individualCardVariant results__individualCardVariant--artist">
                <ArtistSmallCard country={country} />
            </div>
            <div className="results__individualCardVariant results__individualCardVariant--country">
                <ResultsCountryCard country={country} />
            </div>
        </>
    );
}
