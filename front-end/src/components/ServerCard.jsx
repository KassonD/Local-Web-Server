import { Link } from "react-router-dom";
import { ALERT_MODES, BACKEND_URL, SERVER_STATUS } from "../constants";
import { useContext, useEffect, useState } from "react";
import { AlertContext } from "../context/AlertContext";

function ServerCard({ gameName, server }) {
    const [status, setStatus] = useState("offline");
    const sendAlert = useContext(AlertContext);

    const getStatus = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${server.name}/status`, {
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setStatus(data);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    useEffect(() => {
        getStatus();
    }, []);

    return (
        <Link to={`/server/${gameName}/${server.name}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="server-card">
                <img src={BACKEND_URL + server.image_url}></img>
                <div className="card-header">
                    <p>{server.name.replaceAll("_", " ")}</p>
                    <div className={`status-indicator ${status}`}></div>
                </div>
            </div>
        </Link>
    );
}

export default ServerCard;