import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../constants';

function Sidebar({games, setGameIndex}) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
        setGameIndex(selectedIndex);
    }, [selectedIndex])

    return (
        <div className='sidebar'>
            {games.map((game, index) => (
                <button className={'game ' + (selectedIndex === index ? 'selected' : '')} onClick={() => setSelectedIndex(index)}>
                    <img src={`${BACKEND_URL}/images/icons/${games[index]}_icon.png`} alt={game.name} height={32} width={32}></img>
                    <p>{game.replaceAll("_", " ")}</p>
                </button>
            ))}
        </div>
    );
}

export default Sidebar;