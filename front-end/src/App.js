import "./App.css";
import {Route, Routes} from "react-router-dom"
import Dashboard from './pages/Dashboard'
import Server from './pages/Server'
import { useContext, useEffect, useState } from "react";
import { Message } from "./components/Alert";
import LoadingSpinner from "./components/LoadingSpinner";
import { ALERT_MODES, BACKEND_URL } from "./constants";
import { AlertContext } from "./context/AlertContext";

function App() {
    const [backendChecked, setBackendChecked] = useState(false);
    const [backendLoaded, setBackendLoaded] = useState(false);
    const sendAlert = useContext(AlertContext);
    const title = "Home Server"

    const getLoaded = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/loaded`, {
                    method: "GET"
                });
    
                const data = await res.json();
                console.log(data);
    
                if (!res.ok || res == null)
                    throw new Error(data.message || res.status);
    
                setBackendLoaded(data);
                setBackendChecked(true);
            }
            catch (err) {
                console.log("Error: ", err);
                sendAlert(ALERT_MODES.ERROR, err.message);
            }
        }

    useEffect(() => {
        getLoaded();
    }, [])
    
    return (
        <>
            <header className="App-header">{title}</header>
            <div className="App-body">
                {backendLoaded ? (
                    <Routes>
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/server/:gameName/:serverName' element={<Server />} />
                    </Routes>
                ) : (
                    <div className="backend-status">
                        {backendChecked ? (
                            <h1>The backend is loading. You may need to refresh the page.</h1>
                        ) : (
                            <LoadingSpinner text="Checking Backend" size="large"></LoadingSpinner>
                        )}
                    </div>
                )}
                
            </div>
        </>
    );
}

export default App;
