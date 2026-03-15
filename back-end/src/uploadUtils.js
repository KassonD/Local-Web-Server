const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");

const serverDataPath = "data/servers.json"

async function unzipServerPack(src, dest) {
    try {
        const serverZip = await unzipper.Open.file(src);
        await serverZip.extract({ path: dest });   
    }
    catch (err) {
        console.error("Error extracting file:", err);
    }
}

module.exports = {
    unzipServerPack
}