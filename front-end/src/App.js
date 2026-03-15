import "./App.css";
import {Route, Routes} from "react-router-dom"
import Servers from './pages/Servers'

function App() {
    const title = "Local Web Server"

    return (
        <>
            <header className="App-header">{title}</header>
            <div className="App-body">
                <Routes>
                    <Route path='/' element={<Servers />} />
                    <Route path='/servers' element={<Servers />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
