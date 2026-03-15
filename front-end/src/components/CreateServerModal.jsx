import { useState } from 'react';
import LoadingSpinner from "./LoadingSpinner";
import { BACKEND_URL } from '../constants';

function CrearteServerModal({close, game}) {
    const [posting, setPosting] = useState(false);

    const postServer = async (formData) => {
        try {
            setPosting(true);

            const res = await fetch(`${BACKEND_URL}/api/games/${game}/servers`, {
                method: "POST",
                body: formData
            });

            if (!res.ok || res == null)
                throw new Error(res.status);

            const data = await res.json();
            console.log(data);

            setPosting(false);
            close();
        }
        catch (err) {
            console.log("Error: ", err);
            alert(err)
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
                        <input type="text" name='name' placeholder="My Server" required></input>
                    </div>
                    <div className="form-input-container">
                        <label>Server Pack (.zip)</label>
                        <input type="file" name='server_pack' accept='.zip' placeholder="My Server" required></input>
                    </div>
                    <div className="form-input-container">
                        {posting ? (
                            <LoadingSpinner size="medium"></LoadingSpinner>
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