const express = require("express");
const path = require("path");
const mcServerUtils = require('./public/scripts/mcServerUtils')

const app = express();
const port = 3000;

let serverProcess = null;
let serverIndex = 0;

// Prints out all urls
app.use((req, res, next) => {
   console.log(req.url, req.method);
   next();
});

// Parses all json request bodies
app.use(express.json());

//Extra Functionality
app.get('/', (req, res, next) => {
    mcServerUtils.updateServerStatus(serverProcess);
    next();
});

app.get('/api/server-status', (req, res) => {
    res.json({
        isRunning: serverProcess,
        index: serverIndex
    });
});

// Access files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// MC Server
app.post('/start', (req, res) => {
    serverProcess = mcServerUtils.startServer(serverIndex);
});

app.post('/stop', (req, res) => {
    mcServerUtils.stopServer(serverProcess);
    serverProcess = null;
});

app.post('/api/server-index', (req, res) => {
    serverIndex = req.body.index;
});

// If file can't be accessed
app.use((req, res) => {
    res.status(404);
    res.send('Error 404: Not Found');
});

// Sets server port
app.listen(port);

// const http = require('http')
// const fs = require('fs')
// const port = 3000
// const mcServerUtils = require('./scripts/mcServerUtils.js')
// /*netstat -ano | find ":25565"*/

// const server = http.createServer(function (req, res) {
//     res.writeHead(200, { 'Contnet-Type': 'text/html' })
//     if (req.url != null) {
//         // Print url and method
//         console.log(req.url, req.method)
        
//     }
        
//     if (req.url == "/" || req.url == "/app.js") {
//         fs.readFile('pages/index.html', function (error, data) {
//             if (error) {
//                 res.writeHead(404)
//                 res.write('Error: File Not Found')
//             }
//             else {
//                 res.write(data)
//             }
            
//             res.end()
//         })
//     }
//     else if (req.url != "/favicon.ico") {
//         if (req.url === "/server/start" && req.method === "POST") {
//             serverProcess = mcServerUtils.startServer("myServer")
//         }
//         else if (req.url === "/server/stop" && req.method === "POST") {
//             mcServerUtils.stopServer(serverProcess)
//             serverProcess = null
//         }
//         else {
//             fs.readFile('.' + req.url, function (error, data) {
//                 if (error) {
//                     res.writeHead(404)
//                     res.write('Error: File Not Found')
//                 }
//                 else {
//                     res.write(data)
//                 }
                
//                 res.end()
//             })
//         }
//     }
    
//     // else if (req.url == "/pages/server.html") {
//     //     fs.readFile('pages/server.html', function (error, data) {
//     //         if (error) {
//     //             res.writeHead(404)
//     //             res.write('Error: File Not Found')
//     //         }
//     //         else {
//     //             res.write(data)
//     //         }
            
//     //         res.end()
//     //     })
//     // }
//     // else if (req.url == "/pages/settings.html") {
//     //     fs.readFile('./pages/settings.html', function (error, data) {
//     //         if (error) {
//     //             res.writeHead(404)
//     //             res.write('Error: File Not Found')
//     //         }
//     //         else {
//     //             res.write(data)
//     //         }
            
//     //         res.end()
//     //     })
//     // }
//     // else if (req.url == "/css/style.css") {
//     //     fs.readFile('css/style.css', function (error, data) {
//     //         if (error) {
//     //             res.writeHead(404)
//     //             res.write('Error: File Not Found')
//     //         }
//     //         else {
//     //             res.write(data)
//     //         }
            
//     //         res.end()
//     //     })
//     // }
//     // else if (req.url == "/mainPage.js") {
//     //     fs.readFile('scripts/mainPage.js', function (error, data) {
//     //     if (error) {
//     //         res.writeHead(404)
//     //         res.write('Error: File Not Found')
//     //     }
//     //     else {
//     //         res.write(data)
//     //     }

//     //     res.end()
//     //     })
//     // }
//     // else if (req.url == "/serverPage.js") {
//     //     fs.readFile('scripts/serverPage.js', function (error, data) {
//     //     if (error) {
//     //         res.writeHead(404)
//     //         res.write('Error: File Not Found')
//     //     }
//     //     else {
//     //         res.write(data)
//     //     }

//     //     res.end()
//     //     })
//     // }
//     // else if (req.url == "/images/settingsCogs.png") {
//     //     fs.readFile('images/settingsCogs.png', function (error, data) {
//     //     if (error) {
//     //         res.writeHead(404)
//     //         res.write('Error: File Not Found')
//     //     }
//     //     else {
//     //         res.write(data)
//     //     }

//     //     res.end()
//     //     })
//     // }
//     // else if (req.url === "/server/start" && req.method === "POST") {
//     //     serverProcess = mcServerUtils.startServer("myServer")
//     // }
//     // else if (req.url === "/server/stop" && req.method === "POST") {
//     //     mcServerUtils.stopServer(serverProcess)
//     //     serverProcess = null
//     // }
// })

// server.listen(port, function (error) {
//     if (error) {
//         console.log('Something went wrong', error)
//     }
//     else {
//         console.log('Server is listening on port ' + port)
//     }
// })