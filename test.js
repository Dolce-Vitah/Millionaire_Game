const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadURL("https://google.com"); 
});
