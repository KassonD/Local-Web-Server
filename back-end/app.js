const express = require("express");
const multer = require("multer")
const cors = require("cors");
const path = require("path");
const uploadUtils = require("./src/uploadUtils");
const jsonUtils = require("./src/jsonUtils");
const fileUtils = require("./src/fileUtils")
const { spawn } = require("child_process");

const app = express();
const port = 8000;

// Sets server port
app.listen(port);

// Servers
const runningServers = new Map();

// Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "server_pack") {
            cb(null, path.join("server_packs", req.params.gameName));
            
        }
        else if (file.fieldname === "file") {
            cb(null, path.join("servers", req.params.gameName, req.query.path, "/"));
        }
        else {
            cb(null, "public");
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
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
app.use(express.static(path.join(__dirname, 'public')));

// Parses all json and from data request bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

// Get
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
        const server = runningServers.get(`${req.params.gameName}:${req.params.serverName}`);

        if (server) {
            console.log(`${req.params.serverName} is online`)
            res.json("online");
        }
        else {
            console.log(`${req.params.serverName} is offline`)
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
            logs: server.logs.slice(-100),
            logVersion: server.logVersion
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});

// Post
app.post("/api/games/:gameName/servers", upload.single("server_pack"), async (req, res) => {
    try {
        const serverName = await jsonUtils.checkName(req.params.gameName, req.body.name);
        
        if (serverName) {
            await jsonUtils.addServer(req.body, req.params.gameName, serverName)
            
            const src = "server_packs/" + req.params.gameName + "/" + req.file.originalname;
            const dest = "servers/" + req.params.gameName + "/" + serverName;
            
            await uploadUtils.unzipServerPack(src, dest);

            res.status(200).json({
                message: "Server added"
            });
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
        // Starts server
        const serverDir = `./servers/${req.params.gameName}/${req.params.serverName}/`;
        const serverProcess = spawn("cmd.exe", ["/c", "startserver.bat"], {
            cwd: serverDir
        });

        // Adds server to map
        runningServers.set(`${req.params.gameName}:${req.params.serverName}`, {
            process: serverProcess,
            logs: [],
            logVersion: 0
        });

        const server = runningServers.get(`${req.params.gameName}:${req.params.serverName}`);

        // Stores the logs
        server.process.stdout.on("data", data => {
            server.logs.push(data.toString());
            server.logVersion++;
        });

        // When the server stops
        server.process.on("close", () => {
            console.log(`${req.params.serverName} from ${req.params.gameName} successfully stopped.`);

            runningServers.delete(`${req.params.gameName}:${req.params.serverName}`);
        })

        // Success message
        console.log(`Starting ${req.params.serverName} from ${req.params.gameName}...`)
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
        runningServers.get(`${req.params.gameName}:${req.params.serverName}`).process.stdin.write("stop\n");

        // Success message
        console.log(`Stopping ${req.params.serverName} from ${req.params.gameName}...`)
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
        runningServers.get(`${req.params.gameName}:${req.params.serverName}`).process.kill();

        // Success message
        console.log(`Killing ${req.params.serverName} from ${req.params.gameName}...`)
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
        runningServers.get(`${req.params.gameName}:${req.params.serverName}`).process.stdin.write(`${req.body.command}\n`);

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