import { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ServerCard from "../components/ServerCard";
import CreateServerModal from "../components/CreateServerModal";
import { BACKEND_URL, ALERT_MODES } from "../constants";
import { AlertContext } from "../context/AlertContext";

function App() {
    const [gameIndex, setGameIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [games, setGames] = useState([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);
    const sendAlert = useContext(AlertContext);

    const getGames = async () => {
        try {
            setGamesLoaded(false);
            
            const res = await fetch(`${BACKEND_URL}/api/games`, {
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            setGames(data);
            setGamesLoaded(true);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    useEffect(() => {
        if (!showModal)
            getGames();
    }, [showModal]);
    
    return (
        <>
            <Sidebar games={games.map(game => game.name)} setGameIndex={setGameIndex}></Sidebar>
            {showModal && (
                <CreateServerModal close={() => setShowModal(false)} game={games[gameIndex].name}></CreateServerModal>
            )}
            <div className="content-dashboard">
                <div className="header-servers">
                    <div>
                        <p>Servers</p>
                        <button className="primary" onClick={() => setShowModal(true)}>Create Server</button>
                    </div>
                    <div>
                        <input type="search" className="search-server glow" placeholder="Search"></input>
                    </div>
                </div>
                <div className="container-servers">
                    {gamesLoaded && games[gameIndex].servers.map((server) => (
                        <ServerCard gameName={games[gameIndex].name} server={server}></ServerCard>
                    ))}
                </div>
            </div>
        </>
    );
}

export default App;