import { useContext, useState } from 'react';
import LoadingSpinner from "./LoadingSpinner";
import { BACKEND_URL, ALERT_MODES } from '../constants';
import { AlertContext } from '../context/AlertContext';

function FileUploadModal({close, gameName, dirPath}) {
    const [posting, setPosting] = useState(false);
    const [fileType, setFileType] = useState("file");
    const sendAlert = useContext(AlertContext);

    const postFile = async (formData) => {
        try {
            setPosting(true);

            const params = new URLSearchParams({
                path: dirPath.join("/")
            });

            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${fileType}/upload?${params}`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            if (fileType === "file")
                sendAlert(ALERT_MODES.SUCCESS, "File added");
            else
                sendAlert(ALERT_MODES.SUCCESS, "Directory added");
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
        postFile(formData);
    }

    const changeFileType = (event) => {
        setFileType(event.target.value);
    }

    return (
        <>
            <div className="modal-background"></div>
            <div className="modal">
                <div className="modal-header">
                    <p>Add to {dirPath.at(-1)}/</p>
                    {posting ? (
                        <LoadingSpinner size="small"></LoadingSpinner>
                    ) : (
                        <button className="close" onClick={close}>&times;</button>
                    )}
                </div>
                <form onSubmit={submitForm}>
                    <div className="form-input-container">
                        <label>Type</label>
                        <select name="type" onChange={changeFileType}>
                            <option value="file">File</option>
                            <option value="dir">Directory</option>
                        </select>
                    </div>
                    {fileType === "file" ? (
                        <div className="form-input-container">
                            <label>Files</label>
                            <input type="file" name="file" placeholder="My Server" multiple required></input>
                        </div>
                    ) : (
                        <div className="form-input-container">
                            <label>Directory Name</label>
                            <input type="text" name='name' placeholder="my_folder" required></input>
                        </div>
                    )}
                    <div className="form-input-container">
                        {posting ? (
                            <LoadingSpinner size="medium" text="Submitting file"></LoadingSpinner>
                        ) : (
                            <button className="primary">Submit</button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}

export default FileUploadModal;