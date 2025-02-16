const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadURL(`file://${path.join(__dirname, "client", "public", "index.html")}`);
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);