const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (process.env.NODE_ENV === "development") {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.loadFile(path.join(__dirname, "client", "public", "index.html"));
    }

    mainWindow.webContents.openDevTools();
});
