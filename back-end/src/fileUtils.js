const fs = require("fs").promises;
const path = require("path");
const unzipper = require("unzipper");
const { types } = require("./serverTypes");

const serversPath = "/data/servers/"
const packsPath = "/data/server_packs/"

async function ensureFolders(dirPath) {
    const jsonUtils = require("./jsonUtils");
    const games = await jsonUtils.getGames();

    for (const game of games) {
        await fs.mkdir(`/data/server_packs/${game.name}`, { recursive: true });
        await fs.mkdir(`/data/servers/${game.name}`, { recursive: true });
    }
}

async function unzipServerPack(src, dest) {
    try {
        const serverZip = await unzipper.Open.file(src);
        await serverZip.extract({ path: dest });
        return true;
    }
    catch (err) {
        console.log("Error extracting file:", err);
        return false;
    }
}

async function detectServerType(gameName, serverName) {
    try {
        const files = await fs.readdir(path.join(serversPath, gameName, serverName, "/"));

        const forgeInstaller = files.find(file => /^forge-.*-installer\.jar/i.test(file));
        if (forgeInstaller)
            return {type: types.FORGE.label, installer: forgeInstaller};
        
        const neoforgeInstaller = files.find(file => /^neoforge-.*-installer\.jar/i.test(file));
        if (neoforgeInstaller)
            return {type: types.NEOFORGE.label, installer: neoforgeInstaller};

        return {type: types.VANILLA.label};
    }
    catch (err) {
        console.error("Error reading file:", err);
    }
}

async function getDirContent(gameName, dirPath) {

    try {
        const files = await fs.readdir(path.join(serversPath, gameName, dirPath, "/"), { withFileTypes: true });

        let content = [];
        files.forEach(dirent => {
            content.push({
                name: dirent.name,
                isDir: dirent.isDirectory()
            });
        });

        return content;
    }
    catch (err) {
        console.error("Error reading file:", err);
    }
}

async function getFileContent(gameName, filePath) {
    try {
        const file = await fs.readFile(path.join(serversPath, gameName, filePath), "utf8");

        return file;
    }
    catch (err) {
        console.error("Error reading file:", err);
    }
}

async function saveFileContent(gameName, filePath, content) {
    console.log(content, typeof(content));
    try {
        fs.writeFile(path.join(serversPath, gameName, filePath), content);
    }
    catch (err) {
        console.error("Error reading file:", err);
    }
}

async function checkFileExists(gameName, filePath) {
    try {
        await fs.access(path.join(serversPath, gameName, filePath));
        return true;
    }
    catch (err) {
        return false;
    }
}

async function checkDirExists(gameName, dirPath) {
    try {
        console.log(path.join(serversPath, gameName, dirPath));
        const stat = await fs.stat(path.join(serversPath, gameName, dirPath));
        console.log(stat.isDirectory());
        return stat.isDirectory();
    }
    catch (err) {
        console.log("this is false");
        return false;
    }
}

async function addDir(gameName, dirPath) {
    try {
        await fs.mkdir(path.join(serversPath, gameName, dirPath));
    }
    catch (err) {
        console.error("Error creating directory:", err);
    }
}

async function deleteFile(gameName, filePath) {
    try {
        await fs.unlink(path.join(serversPath, gameName, filePath));
    }
    catch (err) {
        console.error("Error creating directory:", err);
    }
}

async function deleteDir(gameName, filePath) {
    try {
        await fs.rm(path.join(serversPath, gameName, filePath), {recursive: true});
    }
    catch (err) {
        console.error("Error creating directory:", err);
    }
}

async function deleteServer(gameName, serverName, packName) {
    try {
        await fs.rm(path.join(serversPath, gameName, serverName), {recursive: true});
        await fs.unlink(path.join(packsPath, gameName, packName));
    }
    catch (err) {
        console.error("Error deleting server:", err);
    }
}

module.exports = {
    ensureFolders,
    unzipServerPack,
    detectServerType,
    getDirContent,
    getFileContent,
    saveFileContent,
    checkFileExists,
    checkDirExists,
    addDir,
    deleteFile,
    deleteDir,
    deleteServer
}