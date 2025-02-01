const express = require('express');
const cors = require('cors');
const http = require('http');
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
    app.use(express.static(path.join(__dirname, "../client")));

    app.get("*", (req, res) => {
        res.sendFile("index.html");
    });
}


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));