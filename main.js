const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadURL(`file://${path.join(__dirname, "client", "public", "index.html")}`)
        .then(() => console.log("URL loaded successfully"))
        .catch((err) => console.error("Error loading URL: ", err));

    win.webContents.openDevTools();
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on("ready", createWindow);
