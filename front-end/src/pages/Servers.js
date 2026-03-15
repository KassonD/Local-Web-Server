import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ServerCard from "../components/ServerCard";
import CrearteServerModal from "../components/CreateServerModal";
import { BACKEND_URL } from "../constants";

function App() {
    const [gameIndex, setGameIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [games, setGames] = useState([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);

    const getGames = async () => {
        try {
            setGamesLoaded(false);
            
            const res = await fetch(`${BACKEND_URL}/api/games`, {
                method: "GET"
            });

            if (!res.ok || res == null)
                throw new Error(res.status);

            const data = await res.json();
            console.log(data);

            setGames(data);
            setGamesLoaded(true);
        }
        catch (err) {
            console.log("Error: ", err);
            alert(err);
        }
    }

    useEffect(() => {
        getGames();
    }, []);
    
    return (
        <>
            <Sidebar games={games.map(game => game.name)} setGameIndex={setGameIndex}></Sidebar>
            {showModal && (
                <CrearteServerModal close={() => setShowModal(false)} game={games[gameIndex].name}></CrearteServerModal>
            )}
            <div className="content">
                <div className="header-servers">
                    <div>
                        <p>Servers</p>
                        <button className="primary" onClick={() => setShowModal(true)}>Create Server</button>
                    </div>
                    <div>
                        <input type="search" className="search-server" placeholder="Search"></input>
                    </div>
                </div>
                <div className="container-servers">
                    {gamesLoaded && games[gameIndex].servers.map((server) => (
                        <ServerCard server={server}></ServerCard>
                    ))}
                </div>
            </div>
        </>
    );
}

export default App;