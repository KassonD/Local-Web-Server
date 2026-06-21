const Docker = require("dockerode");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const serversPath = `${process.env.HOST_PATH}/data/servers`

async function pullServerImages() {
    const imageNames = [
        "itzg/minecraft-server:latest",
        "itzg/minecraft-server:java21",
        "itzg/minecraft-server:java17",
        "itzg/minecraft-server:java8"
    ]

    for (const name of imageNames) {
        console.log(name);
        try {
            await docker.getImage(name).inspect();
        }
        catch {
            await new Promise((resolve, reject) => {
                docker.pull(name, (err, stream) =>{
                    if (err)
                        console.error("Error starting container:", err);
                    else {
                        docker.modem.followProgress(stream, (err) => {
                            if (err)
                                return reject(err);
                            else {
                                console.log(`${name} pulled successfully`);
                                return resolve();
                            }
                        })
                    }
                })
            })
        } 
    }
}

async function createServerContainer(gameName, serverName, detected, version, memory, port) {
    try {
        let javaVersion = "latest";
        if (version <= "1.17.1")
            javaVersion = "java8";
        else if (version <= "1.20.4")
            javaVersion = "java17";
        else if (version <= "1.21.11")
            javaVersion = "java21";
        console.log(version, javaVersion, `itzg/minecraft-server:${javaVersion}`);

        const env = [
            "EULA=TRUE",
            `VERSION=${version}`,
            `TYPE=${detected.type}`,
            `INIT_MEMORY=${memory.init}G`,
            `MAX_MEMORY=${memory.max}G`,
            "SKIP_SERVER_PROPERTIES=TRUE",
            "CREATE_CONSOLE_IN_PIPE=true"
        ];
        console.log(detected, env);

        if (detected.installer)
            env.push(`${detected.type}_INSTALLER=/data/${detected.installer}`);

        const container = await docker.createContainer({
            Image: `itzg/minecraft-server:${javaVersion}`,
            name: `server-${gameName}-${serverName}`,
            Tty: true,
            OpenStdin: false,
            AttachStdin: false,
            HostConfig: {
                Binds: [`${serversPath}/${gameName}/${serverName}:/data`],
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
            },
            Env: env
        });
        
        return container.id;
    }
    catch (err) {
        console.error("Error creating container:", err);
    }
}

async function remakeServerContainer(gameName, serverName, containerId, memory, port) {
    try {
        const oldContainer = docker.getContainer(containerId);
        const oldInfo = await oldContainer.inspect();

        let env = oldInfo.Config.Env;
        env = env.map(value => {
            if (value.startsWith("INIT_MEMORY"))
                return `INIT_MEMORY=${memory.init}G`;

            if (value.startsWith("MAX_MEMORY"))
                return `MAX_MEMORY=${memory.max}G`;
            
            return value;
        });
        console.log(env);

        await oldContainer.remove();

        const container = await docker.createContainer({
            Image: oldInfo.Config.Image,
            name: `server-${gameName}-${serverName}`,
            Tty: true,
            OpenStdin: false,
            AttachStdin: false,
            HostConfig: {
                Binds: [`${serversPath}/${gameName}/${serverName}:/data`],
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
            },
            Env: env
        });
        
        return container.id;
    }
    catch (err) {
        console.error("Error remaking container:", err);
    }
}

async function startContainer(containerId) {
    try {
        const container = docker.getContainer(containerId);
        await container.start();

        // const stream = await container.attach({
        //     stream: true,
        //     stdin: true,
        //     stdout: true,
        //     stderr: true
        // });

        // stream.on("close", () => {
        //     consoleStreams.delete(containerId);
        // });

        // consoleStreams.set(containerId, stream);
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

        const exec = await container.exec({
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            User: "1000",
            Cmd: ["mc-send-to-console", command]
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

        return stream;
    }
    catch (err) {
        console.error("Error getting log stream:", err);
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
    pullServerImages,
    createServerContainer,
    remakeServerContainer,
    startContainer,
    stopContainer,
    killContainer,
    deleteContainer,
    sendComand,
    getLogStream,
    getStatus
}
