const Docker = require("dockerode");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const serversPath = `${process.env.HOST_PATH}/data/servers`

const consoleStreams = new Map();

async function createServerContainer(gameName, serverName, javaVersion) {
    try {
        const container = await docker.createContainer({
            Image: `mc-java${javaVersion}`,
            name: `mc-server-${serverName}`,
            Cmd: ["bash", "-c", "sed -i 's/\\r//' startserver.sh && bash startserver.sh"],
            WorkingDir: `/server`,
            Tty: false,
            OpenStdin: true,
            AttachStdin: true,
            HostConfig: {
                Binds: [`${serversPath}/${gameName}/${serverName}:/server`],
                PortBindings: {
                    "25565/tcp": [
                        {
                            HostPort: "25565"
                        }
                    ]
                }
            },
            ExposedPorts: {
                "25565/tcp": {}
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
        const stream = consoleStreams.get(containerId);

        // console.log("Writable:", stream.writable);
        // console.log("command:", "stop");

        // const result = stream.write("stop\n");
        // console.log("Result:", result);
        const exec = await container.exec({
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            Cmd: ["bash", "-c", `echo "stop" > /proc/1/fd/0`]
        });

        await exec.start();
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
            stderr: true
        });

        const logStream = new require("stream").PassThrough();
        container.modem.demuxStream(stream, logStream, logStream);

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
    sendComand,
    getLogStream,
    getConsoleStream,
    getStatus
}
