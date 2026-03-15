const express = require("express");
const multer = require("multer")
const cors = require("cors");
const path = require("path");
const uploadUtils = require("./src/uploadUtils");
const jsonUtils = require("./src/jsonUtils");

const app = express();
const port = 8000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "server_pack") {
            cb(null, "server_packs/" + req.params.game)
        }
        else {
            cb(null, "public")
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage});

// Enables CORS
const corsOptions = {
    origin: "http://localhost:3000"
}

app.use(cors(corsOptions))


// Prints out all urls
app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
});

// Access files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parses all json request bodies
// app.use(express.json());

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

// app.get("/api/games/:game/servers", async (req, res) => {
//     try {
//         const servers = await jsonUtils.getGameServers(req.params.game);
//         res.json(servers);
//     }
//     catch (err) {
//         console.error(err);
//         res.status(500).json("An error occured");
//     }
// });

// Post
app.post("/api/games/:game/servers", upload.single("server_pack"), async (req, res) => {
    try {
        const serverName = await jsonUtils.checkName(req.params.game, req.body.name);
        
        if (serverName) {
            await jsonUtils.addServer(req.body, req.params.game, serverName)

            const src = "server_packs/" + req.params.game + "/" + req.file.originalname;
            const dest = "servers/" + req.params.game + "/" + serverName;

            await uploadUtils.unzipServerPack(src, dest);

            res.json("Server Added");
        }
        else {
            res.status(500).json("A server already goes by that name");
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occured");
    }
});


// Sets server port
app.listen(port);