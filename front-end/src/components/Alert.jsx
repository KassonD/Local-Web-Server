import { ALERT_MODES } from "../constants";

function Alert({mode = ALERT_MODES.NORMAL, text}) {
    return (
        <div className={`alert ${mode}`}>{(mode === ALERT_MODES.ERROR ? "Error: " : "") + text}</div>
    );
}

export { Alert };