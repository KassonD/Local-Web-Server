const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverDataPath = 'public/json/serverData.json'

function startServer(serverIndex) {
    serverData = JSON.parse(fs.readFileSync(serverDataPath));
    serverName = serverData.servers['server_' + serverIndex].name;

    const serverDirectory = path.join('public/servers', serverName);
    const bat = exec('run.bat', {cwd: serverDirectory});

    bat.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    })

    bat.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    })

    setActiveServer(serverIndex);

    return bat;
}

function stopServer(serverProcess) {
    serverProcess.stdin.write('/stop\n');
    deactivateServer();
}

function buildServerList() {
    serverData = JSON.parse(fs.readFileSync(serverDataPath));

    for (i = 0; i < serverData.serverCount; i++)
    {
        serverName = serverData.servers['server_' + i].name;
    }
}

function addServer(serverName) {
    server = {
        "name": serverName,
        "active": false
    }

    serverData = JSON.parse(fs.readFileSync(serverDataPath));
    serverData.servers['server_' + serverData.serverCount] = server;
    serverData.serverCount++;

    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
}

function setActiveServer(serverIndex) {
    serverData = JSON.parse(fs.readFileSync(serverDataPath));

    serverData.lastServerActive = serverIndex;
    serverData.servers['server_' + serverIndex].active = true;

    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
}

function deactivateServer() {
    serverData = JSON.parse(fs.readFileSync(serverDataPath));
    serverData.servers['server_' + serverData.lastServerActive].active = false;

    fs.writeFileSync(serverDataPath, JSON.stringify(serverData, null, 2));
}

module.exports = {
    startServer,
    stopServer,
    buildServerList
}