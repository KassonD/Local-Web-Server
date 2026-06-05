import "./App.css";
import {Route, Routes} from "react-router-dom"
import Dashboard from './pages/Dashboard'
import Server from './pages/Server'
import { useEffect, useState } from "react";
import { Message } from "./components/Alert";

function App() {
    const title = "Local Web Server"

    return (
        <>
            <header className="App-header">{title}</header>
            <div className="App-body">
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/server/:gameName/:serverName' element={<Server />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
