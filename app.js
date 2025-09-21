

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