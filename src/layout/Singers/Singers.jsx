import './Singers.scss';
import { useMemo, useState } from 'react';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import ResultsTabSelector from '../Results/shared/ResultsTabSelector';
import {
    finalParticipants,
    semiFinal1Participants,
    semiFinal2Participants,
    allParticipants,
} from './../../datas/countries';

export default function Singers() {
    const [selectedFilterKey, setSelectedFilterKey] = useState('all');

    const filterItems = useMemo(
        () => [
            { key: 'all', label: 'Tous' },
            { key: 'semiFinal1', label: 'Demi Finale 1' },
            { key: 'semiFinal2', label: 'Demi Finale 2' },
            { key: 'final', label: 'Finale' },
        ],
        []
    );

    const filteredParticipants = useMemo(() => {
        if (selectedFilterKey === 'all') {
            return allParticipants;
        }

        const participantCodesByFilter = {
            semiFinal1: semiFinal1Participants,
            semiFinal2: semiFinal2Participants,
            final: finalParticipants,
        };

        const participantsByCode = new Map(
            allParticipants.map((country) => [country.code, country]),
        );

        return (participantCodesByFilter[selectedFilterKey] ?? [])
            .map((countryCode) => participantsByCode.get(countryCode))
            .filter(Boolean);
    }, [selectedFilterKey]);

    return (
        <div className="singers">
            <ResultsTabSelector
                items={filterItems}
                selectedKey={selectedFilterKey}
                onChange={setSelectedFilterKey}
                ariaLabel="Filtrer les candidats par session"
                className="singers__filters"
            />
            <div className="main-wrapper">
                {filteredParticipants.map((country) => (
                <ArtistCard country={country} key={country.code} />
                ))}
            </div>
        </div>
    );
}
