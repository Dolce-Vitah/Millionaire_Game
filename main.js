const { app, BrowserWindow } = require("electron");
const path = require("path");
const waitOn = require("wait-on");

const CLIENT_URL = "http://localhost:3000";

let mainWindow;

app.whenReady().then(() => {
    await waitOn({ resources: [CLIENT_URL], timeout: 10000 });

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadURL(CLIENT_URL); 
});
