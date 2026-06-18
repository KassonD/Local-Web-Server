const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const jsonUtils = require("./src/jsonUtils");
const fileUtils = require("./src/fileUtils");
const dockerUtils = require("./src/dockerUtils");
const serverTypes = require("./src/serverTypes");
const { spawn } = require("child_process");
const { json } = require("stream/consumers");


const app = express();
const port = 8000;

// Ensure
let startupComplete = false;
(async () => {
    await fileUtils.ensureFolders();
    await dockerUtils.pullServerImages();
    await serverTypes.refreshVersions();
    startupComplete = true;
})();

// Sets server port
app.listen(port);

// Servers
const runningServers = new Map();

// Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "server_pack") {
            cb(null, path.join("/data/server_packs", req.params.gameName));
        }
        else if (file.fieldname === "file") {
            cb(null, path.join("/data/servers", req.params.gameName, req.query.path, "/"));
        }
        else {
            cb(null, "public");
        }
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name.replaceAll(" ", "_") + "_" + file.originalname);
    }
})

const fileFilter = async (req, file, cb) => {
    if (file.filename === "file") {
        const exists = await fileUtils.checkFileExists(req.params.gameName, path.join(req.query.path, file.originalname));
        if (exists)
            return cb(new Error("File already exists"));
    }

    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileFilter});

// Enables CORS
const corsOptions = {
    origin: "*"
}

app.use(cors(corsOptions))


// Prints out all urls
app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
});

// Access files from public folder
app.use(express.static("/data/public"));

// Parses all json and from data request bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

// Get
app.get("/api/loaded", async (req, res) => {
    try {
        res.json(startupComplete);
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.get("/api/games", async (req, res) => {
    try {
        const games = await jsonUtils.getGames();
        res.json(games);
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.get("/api/games/:gameName/servers/dir", async (req, res) => {
    try {
        console.log(req.query.path);
        const content = await fileUtils.getDirContent(req.params.gameName, req.query.path);

        res.json(content);
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.get("/api/games/:gameName/versions", async (req, res) => {
    try {
        const versions = serverTypes.types.VANILLA.versions;

        res.json(versions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.get("/api/games/:gameName/servers/file", async (req, res) => {
    try {
        const filePath = req.query.path;

        if ([".txt", ".json", ".log", ".bat", ".sh", ".properties", ".toml", ".toml.bak"].includes(filePath.substring(filePath.indexOf(".")))) {
            console.log(filePath);
            const content = await fileUtils.getFileContent(req.params.gameName, req.query.path);

            res.json(content);
        }
        else {
            console.error("File type not accepted");
            res.status(500).json("File type not accepted");
        }

    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.get("/api/games/:gameName/servers/:serverName", async (req, res) => {
    try {
        const games = await jsonUtils.getServer(req.params.gameName, req.params.serverName);
        res.json(games);
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.get("/api/games/:gameName/servers/:serverName/status", async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = req.params.serverName;

        const containerId = await jsonUtils.getContainerId(gameName, serverName);
        const status = await dockerUtils.getStatus(containerId);

        if (status) {
            console.log(`${serverName} is online`)
            res.json("online");
        }
        else {
            console.log(`${serverName} is offline`)
            res.json("offline");
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.get("/api/games/:gameName/servers/:serverName/logs", async (req, res) => {
    try {
        const server = runningServers.get(`${req.params.gameName}:${req.params.serverName}`);

        res.json({
            logs: server.logs,
            logVersion: server.logVersion
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

// Post
// app.post("/api/games/:gameName/servers", upload.none(), async (req, res) => {
//     try {
//         const gameName = req.params.gameName;
//         const serverName = await jsonUtils.checkName(gameName, req.body.name);
        
//         if (serverName) {
//             await fileUtils.addDir(gameName, serverName);

//             const containerId = await dockerUtils.createServerContainer(gameName, serverName, "NEOFORGE", "1.21.1", "8G", req.body.port);
//             await jsonUtils.addServer(req.body, gameName, serverName, containerId, req.body.port);

//             res.status(200).json({
//                 message: "Server added"
//             });
//         }
//         else {
//             res.status(409).json({
//                 message: "A server already goes by that name"
//             });
//         }
//     }
//     catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: "An error occured"
//         });
//     }
// });
app.post("/api/games/:gameName/servers", upload.single("server_pack"), async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = await jsonUtils.checkName(gameName, req.body.name);
        const packName = serverName + "_" + req.file.originalname;
        const version = req.body.version;
        const memory = req.body.memory;
        const serverPort = req.body.port;
        
        if (serverName) {
            const src = "/data/server_packs/" + gameName + "/" + packName;
            const dest = "/data/servers/" + gameName + "/" + serverName;
            const unzipped = await fileUtils.unzipServerPack(src, dest);

            if (unzipped) {
                const detected = await fileUtils.detectServerType(gameName, serverName);

                const containerId = await dockerUtils.createServerContainer(gameName, serverName, detected, version, memory, serverPort);
                await jsonUtils.addServer(gameName, serverName, packName, version, memory, serverPort, containerId);

                res.status(200).json({
                    message: "Server added"
                });
            }
            else {
                await fileUtils.deleteServer(gameName, serverName, packName);
                res.status(500).json({
                    message: "Error while unzipping"
                });
            }
        }
        else {
            res.status(409).json({
                message: "A server already goes by that name"
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/file", upload.none(), async (req, res) => {
    try {
        await fileUtils.saveFileContent(req.params.gameName, req.query.path, req.body.content);

        console.log("File saved");
        res.status(200).json({
            message: "File saved"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/file/upload", upload.array("file"), async (req, res) => {
    try {
        res.status(200).json({
            message: "File saved"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/dir/upload", upload.none(), async (req, res) => {
    try {
        const dirPath = path.join(req.query.path, req.body.name);
        const exists = await fileUtils.checkDirExists(req.params.gameName, dirPath)

        if (exists) {
            res.status(409).json({
                message: "Already exists"
            });
        }
        else {
            fileUtils.addDir(req.params.gameName, dirPath)

            res.status(200).json({
                message: "Directory added"
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/file/delete", async (req, res) => {
    try {
        await fileUtils.deleteFile(req.params.gameName, req.query.path);

        res.status(200).json({
            message: "File deleted"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/dir/delete", async (req, res) => {
    try {
        await fileUtils.deleteDir(req.params.gameName, req.query.path);

        res.status(200).json({
            message: "Directory deleted"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/:serverName/start", async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = req.params.serverName;

        // Starts server
        const containerId = await jsonUtils.getContainerId(gameName, serverName);
        await dockerUtils.startContainer(containerId);

        // Adds server to map
        runningServers.set(`${gameName}:${serverName}`, {
            containerId: containerId,
            logs: [],
            logVersion: 0
        });

        // Store logs
        const logStream = await dockerUtils.getLogStream(containerId);
        const server = runningServers.get(`${gameName}:${serverName}`);

        logStream.on("data", data => {
            if (server.logs.length > 100)
                server.logs.shift();

            server.logs.push(data.toString());
            server.logVersion++;
        });

        logStream.on("close", data => {
            runningServers.delete(`${gameName}:${serverName}`);
        });

        // Success message
        console.log(`Starting ${serverName} from ${gameName}...`)
        res.status(200).json({
            message: "Server starting"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/:serverName/stop", async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = req.params.serverName;

        const containerId = await jsonUtils.getContainerId(gameName, serverName);
        await dockerUtils.stopContainer(containerId);

        // Success message
        console.log(`Stopping ${serverName} from ${gameName}...`)
        res.status(200).json({
            message: "Server stopping"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/:serverName/kill", async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = req.params.serverName;

        const containerId = await jsonUtils.getContainerId(gameName, serverName);
        await dockerUtils.killContainer(containerId);

        // Success message
        console.log(`Killing ${serverName} from ${gameName}...`)
        res.status(200).json({
            message: "Killing process"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "An error occured"
        });
    }
});

app.post("/api/games/:gameName/servers/:serverName/command", upload.none(), async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = req.params.serverName;

        const containerId = await jsonUtils.getContainerId(gameName, serverName);
        await dockerUtils.sendComand(containerId, req.body.command);

        console.log(`Command: ${req.body.command}`);
        res.status(200).json({
            message: "Command sent"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

app.post("/api/games/:gameName/servers/:serverName/delete", upload.none(), async (req, res) => {
    try {
        const gameName = req.params.gameName;
        const serverName = req.params.serverName;

        const containerId = await jsonUtils.getContainerId(gameName, serverName);
        const server = await jsonUtils.getServer(gameName, serverName);

        await dockerUtils.deleteContainer(containerId);
        await fileUtils.deleteServer(gameName, serverName, server.pack_name);
        await jsonUtils.deleteServer(gameName, serverName);

        res.status(200).json({
            message: "Server Deleted"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});