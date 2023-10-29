const { app, BrowserWindow } = require("electron")
const { autoUpdater, AppUpdater } = require("electron-updater")
const path = require("path")
const url = require("url")
const { loadPorts } = require("./src/port")
const { iSocket } = require("./src/socket")
require("electron-reload")(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/node_modules/electron`)
})
// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

global.ports = []
global.io

let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1800,
        height: 800,
        autoHideMenuBar: true,
        backgroundColor: "#ccc",
        webPreferences: {
            nodeIntegration: false, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, "preload.js")
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "src/resources/views/mainWindow.html"),
        protocol: "file:",
        slashes: true
    }))

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow()
    iSocket()
    loadPorts()
    autoUpdater.checkForUpdates()
})

// Quit when all windows are closed.
app.on("window-all-closed", function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on("activate", function() {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


autoUpdater.on("update-available", (info) => {
    global.io.emit("update", info)
})