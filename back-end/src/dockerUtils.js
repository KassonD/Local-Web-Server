const Docker = require("dockerode");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const serversPath = `${process.env.HOST_PATH}/data/servers`

const consoleStreams = new Map();

async function createServerContainer(gameName, serverName, javaVersion, port) {
    try {
        const container = await docker.createContainer({
            Image: `mc-java${javaVersion}`,
            name: `server-${gameName}-${serverName}`,
            Cmd: ["bash", "-c", "sed -i 's/\\r//' startserver.sh && bash startserver.sh"],
            WorkingDir: `/server`,
            Tty: false,
            OpenStdin: true,
            AttachStdin: true,
            HostConfig: {
                Binds: [`${serversPath}/${gameName}/${serverName}:/server`],
                PortBindings: {
                    [`${port}/tcp`]: [
                        {
                            HostPort: `${port}`
                        }
                    ]
                }
            },
            ExposedPorts: {
                [`${port}/tcp`]: {}
            }
        });
        
        return container.id;
    }
    catch (err) {
        console.error("Error creating container:", err);
    }
}

async function startContainer(containerId) {
    try {
        const container = docker.getContainer(containerId);
        await container.start();

        const stream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true
        });

        stream.on("close", () => {
            consoleStreams.delete(containerId);
        });

        consoleStreams.set(containerId, stream);
    }
    catch (err) {
        console.error("Error starting container:", err);
    }
}

async function stopContainer(containerId) {
    try {
        const container = docker.getContainer(containerId);
        await container.stop();
    }
    catch (err) {
        console.error("Error stopping container:", err);
    }
}

async function killContainer(containerId) {
    try {
        const container = docker.getContainer(containerId);
        await container.kill();
    }
    catch (err) {
        console.error("Error killing container:", err);
    }
}

async function deleteContainer(containerId) {
    try {
        const container = docker.getContainer(containerId);

        const data = await container.inspect();
        if (data.State.Running)
            await container.stop();
        
        await container.remove();
    }
    catch (err) {
        console.error("Error deleting container:", err);
    }
}

async function sendComand(containerId, command) {
    try {
        const container = docker.getContainer(containerId);
        // const stream = consoleStreams.get(containerId);

        // stream.write(`${command}\n`);
        const exec = await container.exec({
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            Cmd: ["bash", "-c", `echo "${command}" > /proc/1/fd/0`]
        });

        await exec.start();
    }
    catch (err) {
        console.error("Error sending command:", err);
    }
}

async function getLogStream(containerId) {
    try {
        const container = docker.getContainer(containerId);
        const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
            tail: 100
        });
        stream.resume();

        const logStream = new require("stream").PassThrough({ highWaterMark: 0 });
        container.modem.demuxStream(stream, logStream, logStream);
        logStream.resume();

        return logStream;
    }
    catch (err) {
        console.error("Error getting log stream:", err);
    }
}

async function getConsoleStream(containerId) {
    try {
        const container = docker.getContainer(containerId);
        const stream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true
        });

        return stream;
    }
    catch (err) {
        console.error("Error getting console stream:", err);
    }
}

async function getStatus(containerId) {
    try {
        const container = docker.getContainer(containerId);
        const data = await container.inspect();

        return data.State.Running;
    }
    catch (err) {
        console.error("Error getting status:", err);
    }
    
}

module.exports = {
    createServerContainer,
    startContainer,
    stopContainer,
    killContainer,
    deleteContainer,
    sendComand,
    getLogStream,
    getConsoleStream,
    getStatus
}
