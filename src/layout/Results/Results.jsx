import { useState } from 'react';
import './Results.scss';
import CommunityResults from './CommunityResults/CommunityResults';
import IndividualResults from './IndividualResults/IndividualResults';
import ResultsTabSelector from './shared/ResultsTabSelector';
import {
    DEFAULT_RESULTS_SESSION_KEY,
    RESULTS_SESSION_CONFIGS,
    RESULTS_VIEW_CONFIGS,
} from './shared/resultsShared';

export default function Results() {
    const [selectedView, setSelectedView] = useState('community');
    const [selectedSessionKey, setSelectedSessionKey] = useState(
        DEFAULT_RESULTS_SESSION_KEY,
    );

    return (
        <main className="results">
            <div className="results__navigation">
                <ResultsTabSelector
                    items={RESULTS_VIEW_CONFIGS}
                    selectedKey={selectedView}
                    onChange={setSelectedView}
                    ariaLabel="Type de résultats"
                />
                <ResultsTabSelector
                    items={Object.values(RESULTS_SESSION_CONFIGS).map(
                        (sessionConfig) => ({
                            key: sessionConfig.sessionKey,
                            label: sessionConfig.title,
                        }),
                    )}
                    selectedKey={selectedSessionKey}
                    onChange={setSelectedSessionKey}
                    ariaLabel="Sélection de session"
                />
            </div>

            {selectedView === 'community' ? (
                <CommunityResults selectedSessionKey={selectedSessionKey} />
            ) : (
                <IndividualResults selectedSessionKey={selectedSessionKey} />
            )}
        </main>
    );
}
