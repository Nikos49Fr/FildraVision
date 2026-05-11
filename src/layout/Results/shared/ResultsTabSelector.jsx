export default function ResultsTabSelector({
    items,
    selectedKey,
    onChange,
    ariaLabel,
    className = '',
}) {
    return (
        <nav
            className={['results__tabSelector', className].filter(Boolean).join(' ')}
            aria-label={ariaLabel}
        >
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    className="results__tabButton"
                    data-active={item.key === selectedKey}
                    onClick={() => onChange(item.key)}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
