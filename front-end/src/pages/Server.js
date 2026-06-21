import { useContext, useEffect, useRef, useState } from "react";
import { ALERT_MODES, BACKEND_URL, SERVER_STATUS, SPINNER_SIZE } from "../constants";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import LoadingSpinner from "../components/LoadingSpinner"
import Console from "../components/Console";
import FileEditor from "../components/FileEditer";
import { ConfirmationContext } from "../context/ConfirmationContext";

function App() {
    const { gameName, serverName } = useParams();
    const [gameIndex, setGameIndex] = useState(0);
    const [server, setServer] = useState([]);
    const [serverLoaded, setServerLoaded] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedTab, setSelectedTab] = useState("server");
    const [serverStatus, setServerStatus] = useState("N/A");
    const [logs, setLogs] = useState([]);
    const [maxMemory, setMaxMemory] = useState(8);
    const logVersion = useRef(-1);
    const sendAlert = useContext(AlertContext);
    const confirm = useContext(ConfirmationContext);
    const navigate = useNavigate();

    const getStatus = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/status`, {
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setServerStatus(data);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const getLogs = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/logs`, {
                method: "GET"
            });

            const data = await res.json();
            // console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);
            
            if (data.logVersion !== logVersion.current) {
                setLogs(data.logs);
                logVersion.current = data.logVersion
            }
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const startServer = async () => {
        try {
            setServerStatus("N/A");
            
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/start`, {
                method: "POST"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            await getStatus();

            sendAlert(ALERT_MODES.SUCCESS, data.message);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const stopServer = async () => {
        try {
            setServerLoaded(false);
            
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/stop`, {
                method: "POST"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            sendAlert(ALERT_MODES.SUCCESS, data.message);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const killServer = async () => {
        try {
            setServerLoaded(false);
            
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/kill`, {
                method: "POST"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            sendAlert(ALERT_MODES.SUCCESS, data.message);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const getServer = async () => {
        try {
            setServerLoaded(false);
            
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}`, {
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setServer(data);

            await getStatus();

            setServerLoaded(true);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const deleteServer = async () => {
        try {
            const confirmed = await confirm(`Delete ${serverName} ?`, "This action can NOT be undone.");

            if (confirmed) {
                setDeleting(true);
                
                const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/delete`, {
                    method: "POST"
                });

                const data = await res.json();
                console.log(data);

                if (!res.ok || res == null)
                    throw new Error(data.message || res.status);

                sendAlert(ALERT_MODES.SUCCESS, "Server deleted");
                navigate("/dashboard");
            }
            else
                sendAlert(ALERT_MODES.SUCCESS, "Deletion canceled");
        }
        catch (err) {
            setDeleting(false);
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const saveSettings = async (formData) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/settings`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            sendAlert(ALERT_MODES.SUCCESS, "Settings saved");
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const submitForm = (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        console.log(formData)
        saveSettings(formData);
    }

    const setMaxMemoryInput = (event) => {
        console.log(event.target.checked);
        setMaxMemory(event.target.value);
    }

    useEffect(() => {
        getServer();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getStatus();
            if (serverStatus === SERVER_STATUS.ONLINE)
                getLogs();
        }, 1000);
        return () => clearInterval(interval);
    }, [serverStatus]);
    
    return (
        <>
            <div className="content-server">
                <Link to={`/`} style={{ textDecoration: "none", color: "inherit" }}>
                    <button className="secondary" >{"❮"}</button>
                </Link>
                <div className="tabs">
                    <ul className="tab-labels">
                        <li className={(selectedTab === "server") && "selected"} onClick={() => setSelectedTab("server")}>Server</li>
                        <li className={(selectedTab === "files") && "selected"} onClick={() => setSelectedTab("files")}>Files</li>
                        <li className={(selectedTab === "settings") && "selected"} onClick={() => setSelectedTab("settings")}>Settings</li>
                    </ul>
                    {!deleting ? (
                        <div className="tab-content">
                            {selectedTab === "server" && (
                                <>
                                    <div className="tab-container">
                                        <div className="info">
                                            <label>Name:</label>
                                            <p>{String(server.name).replaceAll("_", " ")}</p>
                                        </div>
                                        <div className="info">
                                            <label>Game:</label>
                                            <p>{String(gameName).replaceAll("_", " ")}</p>
                                        </div>
                                        <div className="info">
                                            <label>Type:</label>
                                            <p>{server.type}</p>
                                        </div>
                                        <div className="info">
                                            <label>Version:</label>
                                            <p>{server.version}</p>
                                        </div>
                                    </div>
                                    <div className="tab-container">
                                        <div className="tab-button-container">
                                        {serverStatus === SERVER_STATUS.OFFLINE ? (
                                            <button className="start" onClick={startServer}>Start</button>
                                        ) : serverStatus === SERVER_STATUS.ONLINE ? (
                                            <>
                                                <button className="stop" onClick={stopServer}>Stop</button>
                                                <button className="kill" onClick={killServer}>Kill</button>
                                            </>
                                        ) : (
                                            <LoadingSpinner size={SPINNER_SIZE.MEDIUM} text="Getting status "></LoadingSpinner>
                                        )}
                                    </div>
                                    </div>
                                    <Console gameName={gameName} serverName={serverName} logs={logs}></Console>
                                </>
                            )}
                            {selectedTab === "files" && (
                                <FileEditor gameName={gameName} serverName={serverName} serverStatus={serverStatus}></FileEditor>
                            )}
                            {selectedTab === "settings" && (
                                <>
                                    <form className="tab-container" onSubmit={submitForm}>
                                        <div className="info">
                                            <label>Memory (GB):</label>
                                            <input className="glow" type="number" name='memInit' min={2} max={maxMemory} defaultValue={server.memory.init} readOnly={serverStatus === SERVER_STATUS.ONLINE} required></input>
                                            -
                                            <input className="glow" type="number" name='memMax' min={2} max={16} defaultValue={server.memory.max} onChange={setMaxMemoryInput} readOnly={serverStatus === SERVER_STATUS.ONLINE} required></input>
                                        </div>
                                        <div className="info">
                                            <label>Port:</label>
                                            <input className="glow" type="number" name='port' min={1} max={65535} defaultValue={server.port} readOnly={serverStatus === SERVER_STATUS.ONLINE} required></input>
                                        </div>
                                        {serverStatus === SERVER_STATUS.ONLINE ? (
                                            <h4>(Server must be offline to edit)</h4>
                                        ) : (
                                            <button className="primary-subtle">Save</button>
                                        )}
                                    </form>
                                    <div className="tab-container">
                                        <div className="tab-button-container">
                                            {serverStatus === SERVER_STATUS.OFFLINE ? (
                                                <button className="stop" onClick={deleteServer}>Delete Server</button>
                                            ) : (
                                                <p>Server must be offline to delete</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="tab-container">
                            <div className="tab-button-container">
                                <LoadingSpinner text="Deleting" size="medium"></LoadingSpinner>
                            </div>
                        </div>
                    )}
                    
                </div>
            </div>
        </>
    );
}

export default App;