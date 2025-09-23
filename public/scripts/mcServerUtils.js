const { exec } = require('child_process')
const path = require('path')

function startServer(serverName) {
    const serverDirectory = path.join('servers', serverName)
    const bat = exec('run.bat', {cwd: serverDirectory});

    bat.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    })

    bat.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
    })

    return bat
}

function stopServer(serverProcess) {
    serverProcess.stdin.write('/stop\n')
}

function buildServerList(){

}

module.exports = {
    startServer,
    stopServer
}