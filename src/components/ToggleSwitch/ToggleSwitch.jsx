import './ToggleSwitch.scss';

export default function ToggleSwitch({
    checked = false,
    disabled = false,
    onChange,
    className = '',
    actionLabelOn = 'Fermer les votes',
    actionLabelOff = 'Ouvrir les votes',
    id,
}) {
    const resolvedActionLabel = checked ? actionLabelOn : actionLabelOff;

    function handleChange(event) {
        onChange?.(event.target.checked);
    }

    return (
        <label
            className={['toggleSwitch', className].filter(Boolean).join(' ')}
            data-checked={checked}
            data-disabled={disabled}
            htmlFor={id}
        >
            <span className="toggleSwitch__actionLabel">
                {resolvedActionLabel}
            </span>
            <input
                id={id}
                className="toggleSwitch__input"
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
            />
            <span className="toggleSwitch__track" aria-hidden="true">
                <span className="toggleSwitch__thumb" />
            </span>
        </label>
    );
}
