const fs = require("fs").promises;
const path = require("path");

const serverDataPath = "data/servers.json"

async function getGames() {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const servers = serverData.games;

        return servers;
    }
    catch (err) {
        console.error("Error reading file:", err);
        return;
    }
}

async function checkName(gameName, serverName) {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const servers = serverData.games.find(g => g.name === gameName).servers;
        
        const name = serverName.replaceAll(" ", "_");
        const nameCheck = servers.find(server => server.name === name);

        if (nameCheck) {
            return;
        }
        else {
            return name;
        }
    }
    catch (err) {
        console.error("Error reading file:", err);
        return;
    }
}

async function addServer(newData, gameName, serverName) {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const servers = serverData.games.find(g => g.name === gameName).servers;

        const pushData = {
            "name": serverName,
            "active": false,
            "image_url": `/images/defaults/${gameName}_default.png`
        }
        servers.push(pushData)

        fs.writeFile(serverDataPath, JSON.stringify(serverData, null, 2));
    }
    catch (err) {
        console.error("Error reading file:", err);
    }
}


module.exports = {
    getGames,
    checkName,
    addServer
}