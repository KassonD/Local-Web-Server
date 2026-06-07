import { useContext, useState } from 'react';
import LoadingSpinner from "./LoadingSpinner";
import { BACKEND_URL, ALERT_MODES } from '../constants';
import { AlertContext } from '../context/AlertContext';

function CrearteServerModal({close, game}) {
    const [posting, setPosting] = useState(false);
    const sendAlert = useContext(AlertContext);

    const postServer = async (formData) => {
        try {
            setPosting(true);

            const res = await fetch(`${BACKEND_URL}/api/games/${game}/servers`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setPosting(false);
            sendAlert(ALERT_MODES.SUCCESS, "Server added!");
            close();
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
            setPosting(false);
        }
    }

    const submitForm = (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        console.log(formData)
        postServer(formData);
    }

    return (
        <>
            <div className="modal-background"></div>
            <div className="modal">
                <div className="modal-header">
                    <p>Create Server ({game.replaceAll("_", " ")})</p>
                    {posting ? (
                        <LoadingSpinner size="small"></LoadingSpinner>
                    ) : (
                        <button className="close" onClick={close}>&times;</button>
                    )}
                </div>
                <form onSubmit={submitForm}>
                    <div className="form-input-container">
                        <label>Server Name</label>
                        <input type="text" name='name' placeholder="My Server" pattern="[A-Za-z0-9]+[A-Za-z0-9 ]*"  required></input>
                    </div>
                    <div className="form-input-container">
                        <label>Server Pack (.zip)</label>
                        <input type="file" name='server_pack' accept='.zip' placeholder="My Server" required></input>
                    </div>
                    <div className="form-input-container">
                        {posting ? (
                            <LoadingSpinner size="medium" text="Submitting server"></LoadingSpinner>
                        ) : (
                            <button className="primary">Submit</button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}

export default CrearteServerModal;