const fs = require("fs").promises;
const path = require("path");

const serverDataPath = "/data/json/servers.json"

async function getGames() {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const games = serverData.games;

        return games;
    }
    catch (err) {
        console.error("Error reading file:", err);
        return;
    }
}

async function getServer(gameName, serverName) {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const game = serverData.games.find(game => game.name === gameName);
        const server = game.servers.find(server => server.name === serverName);

        return server;
    }
    catch (err) {
        console.error("Error reading file:", err);
        return;
    }
}

async function getContainerId(gameName, serverName) {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const game = serverData.games.find(game => game.name === gameName);
        const server = game.servers.find(server => server.name === serverName);

        return server.container_id;
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

async function addServer(newData, gameName, serverName, packName, containerId) {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data); 
        const servers = serverData.games.find(g => g.name === gameName).servers;
        
        const pushData = {
            "name": serverName,
            "pack_name": packName,
            "container_id": containerId,
            "image_url": `/images/defaults/${gameName}_default.png`
        }
        servers.push(pushData)

        fs.writeFile(serverDataPath, JSON.stringify(serverData, null, 2));
    }
    catch (err) {
        console.error("Error reading file:", err);
    }
}

async function deleteServer(gameName, serverName) {
    try {
        const data = await fs.readFile(serverDataPath, "utf8");
        const serverData = await JSON.parse(data);
        const game = serverData.games.find(game => game.name === gameName);
        const server = game.servers.find(server => server.name === serverName);

        if (server) {
            game.servers = game.servers.filter(server => server.name !== serverName);
            fs.writeFile(serverDataPath, JSON.stringify(serverData, null, 2));
            console.log(game);
        }
        else
            console.log(game, "didn't work though");
    }
    catch (err) {
        console.error("Error deleting file:", err);
    }
}

module.exports = {
    getGames,
    getServer,
    getContainerId,
    checkName,
    addServer,
    deleteServer
}