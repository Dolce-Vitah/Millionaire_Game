const { app, BrowserWindow } = require("electron");
const waitOn = require("wait-on");
const path = require("path");

const CLIENT_URL = "http://localhost:3000"; 

async function createWindow() {
  console.log("Waiting for React...");

  try {
    await waitOn({ resources: [CLIENT_URL], timeout: 15000 }); 
    console.log("React is ready! Launching Electron...");

    let mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    mainWindow.loadURL(CLIENT_URL);
    mainWindow.webContents.openDevTools(); 
  } catch (err) {
    console.error("React did not start in time:", err);
    console.log("Trying to load built version...");

    let mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    mainWindow.loadFile(path.join(__dirname, "client", "build", "index.html"));
  }
}

app.whenReady().then(createWindow);
