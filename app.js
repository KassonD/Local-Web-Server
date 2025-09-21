const express = require("express")
const path = require("path")

const app = express()
const port = 3000

// Access files from public folder
app.use(express.static(path.join(__dirname, 'public')))

// If file can't be accessed
app.use((req, res) => {
    res.status(404);
    res.send('Error 404: Not Found')
})

// Sets server port
app.listen(port)
