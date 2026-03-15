import { BACKEND_URL } from "../constants";

function ServerCard({server}) {
    return (
        <div className="server-card">
            <img src={BACKEND_URL + server.image_url}></img>
            <div className="card-header">
                <p>{server.name.replaceAll("_", " ")}</p>
                <div className="status-indicator" style={server.active ? {backgroundColor: "lime",} : {backgroundColor: "red",}}></div>
            </div>
        </div>
    );
}

export default ServerCard;