const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const PORT = 8080;

const questionsRoutes = require("./routes/questionsRoutes");
const lifelinesRoutes = require("./routes/lifelinesRoutes");
const gameRoutes = require("./routes/gameRoutes");


const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


app.use("/questions", questionsRoutes);
app.use("/lifelines", lifelinesRoutes);
app.use("/game", gameRoutes);


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    });
}

const wss = new WebSocket.Server({ server });
const { initSocketServer } = require("./services/socketHandler");
initSocketServer(wss);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));