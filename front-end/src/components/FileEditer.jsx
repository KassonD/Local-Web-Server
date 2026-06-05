import { useContext, useEffect, useState } from 'react';
import { BACKEND_URL, ALERT_MODES, SERVER_STATUS } from '../constants';
import { AlertContext } from '../context/AlertContext';
import FileUploadModal from './FileUploadModal';
import ConfirmationModal from './ConfirmationModal';
import { ConfirmationContext } from '../context/ConfirmationContext';

function FileEditor({gameName, serverName, serverStatus}) {
    const [dirPath, setDirPath] = useState([serverName]);
    const [dirContent, setDirContent] = useState([]);
    const [fileContent, setFileContent] = useState([]);
    const [fileName, setFileName] = useState("No file selected");
    const [depth, setDepth] = useState(0);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [fileLoaded, setFileLoaded] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const sendAlert = useContext(AlertContext);
    const confirm = useContext(ConfirmationContext);

    const changeDir = (dirName) => {
        setDirPath([...dirPath, dirName]);
        setDepth(depth + 1);
    }

    const backDir = () => {
        if (depth > 0) {
            setDirPath(dirPath.slice(0, -1));
            setDepth(depth - 1);
        }
    }

    const getDirContent = async () => {
        try {
            const params = new URLSearchParams({
                path: dirPath.join("/")
            });

            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/dir?${params}`, {
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setDirContent(data);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const getFileContent = async (name) => {
        try {
            setFileLoaded(false);

            const params = new URLSearchParams({
                path: dirPath.join("/") + `/${name}`
            });

            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/file?${params}`, {
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setFileContent(data);
            setFileLoaded(true);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const saveFileContent = async (name, formData) => {
        try {
            const params = new URLSearchParams({
                path: dirPath.join("/") + `/${name}`
            });

            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/file?${params}`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            sendAlert(ALERT_MODES.SUCCESS, "File saved");
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const deleteFile = async (name) => {
        try {
            const confirmed = await confirm(`Delete ${name} ?`);

            if (confirmed) {
                const params = new URLSearchParams({
                    path: dirPath.join("/") + `/${name}`
                });

                const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/file/delete?${params}`, {
                    method: "POST"
                });

                const data = await res.json();
                console.log(data);

                if (!res.ok || res == null)
                    throw new Error(data.message || res.status);

                sendAlert(ALERT_MODES.SUCCESS, "File deleted");

                await getDirContent();
            }
            else
                sendAlert(ALERT_MODES.SUCCESS, "Deletion canceled");
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const deleteDir = async (name) => {
        try {
            const confirmed = await confirm(`Delete (dir) ${name} ?`, "Deleting this directory will delete all of it's contents. This action can NOT be undone.");

            if (confirmed) {
                const params = new URLSearchParams({
                    path: dirPath.join("/") + `/${name}`
                });

                const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/dir/delete?${params}`, {
                    method: "POST"
                });

                const data = await res.json();
                console.log(data);

                if (!res.ok || res == null)
                    throw new Error(data.message || res.status);

                sendAlert(ALERT_MODES.SUCCESS, "Directory deleted");

                await getDirContent();
            }
            else
                sendAlert(ALERT_MODES.SUCCESS, "Deletion canceled");
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const submitForm = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        saveFileContent(fileName, formData);
    }

    useEffect(() => {
        getDirContent();
    }, [dirPath]);

    return (
        <>
            {showUploadModal &&
                <FileUploadModal close={() => {getDirContent(); setShowUploadModal(false)}} gameName={gameName} dirPath={dirPath}></FileUploadModal>
            }
            <div className="file-editor">
                <div className="file-nav">
                    <div className="file-nav-header">
                        <button className="secondary-icon" onClick={backDir}>❮</button>
                        <h4>{`${depth > 0 ? ".../" : ""}${dirPath.at(-1)}/`}</h4>
                        <button className="secondary-icon" onClick={() => setShowUploadModal(true)}>+</button>
                    </div>
                    <div className='file-nav-content'>
                        {dirContent.sort((a, b) => b.isDir - a.isDir).map((file) => {
                            if (file.isDir)
                                return <div className="file-item">
                                    <p onClick={() => changeDir(file.name)}>(dir) {file.name}</p>
                                    <button className="icon" onClick={() => deleteDir(file.name)}>Delete</button>
                                </div>
                            else
                                return <div className="file-item">
                                    <p onClick={() => {getFileContent(file.name); setFileName(file.name);}}>{file.name}</p>
                                    <button className="icon" onClick={() => deleteFile(file.name)}>Delete</button>
                                </div>
                        })}
                    </div>
                </div>
                <form onSubmit={submitForm}>
                    <div className="file-text-header">
                        <h4>{fileName}</h4>
                        <div className="file-text-header-buttons">
                            {fileLoaded && (serverStatus === SERVER_STATUS.OFFLINE ? (
                                <button type="submit" className="primary-subtle">Save</button>
                            ) : (
                                <h4>(Server must be offline to edit)</h4>
                            ))}
                            <button type="button" className="secondary-icon" onClick={() => fileLoaded && getFileContent(fileName)}>⭯</button>
                        </div>
                    </div>
                    {fileLoaded && (
                        <textarea type="textarea" name="content" className="file-text" defaultValue={fileContent} readOnly={serverStatus === SERVER_STATUS.ONLINE}></textarea>
                    )}
                </form>
            </div>
        </>
    );
}

export default FileEditor;