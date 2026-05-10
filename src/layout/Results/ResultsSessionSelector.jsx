export default function ResultsSessionSelector({
    sessionConfigs,
    selectedSessionKey,
    onChange,
}) {
    return (
        <nav className="results__sessionSelector" aria-label="Selection de session">
            {sessionConfigs.map((sessionConfig) => (
                <button
                    key={sessionConfig.sessionKey}
                    type="button"
                    className="results__sessionButton"
                    data-active={sessionConfig.sessionKey === selectedSessionKey}
                    onClick={() => onChange(sessionConfig.sessionKey)}
                >
                    {sessionConfig.title}
                </button>
            ))}
        </nav>
    );
}
