const { Server } = require("socket.io")
const { autoUpdater } = require("electron-updater")
let { loadPorts, selfLoad } = require("./port")

const iSocket = () => {
    global.io = new Server(3000)
    global.defaultSocket
    io.on("connection", (socket) => {
        autoUpdater.checkForUpdates()

        global.defaultSocket = socket

        let onLoadPort = () => {
            io.emit("onLoadPort", global.ports.map((port) => {
                return port.useable()
            }))
            setTimeout(() => {
                onLoadPort()
            }, 3000)
        }
        onLoadPort()

        socket.on("communicate", (payload) => {
            switch(payload.command){
                case "fixLightOn": {
                    let portIndex = payload.portIndex
                    global.ports[portIndex].clear()
                    global.ports[portIndex].close()
                    global.ports[portIndex].fixLightOn()
                    return
                }
                case "reloadPorts": {
                    let portIndexs = payload.portIndexs
                    portIndexs.forEach((portIndex) => {
                        global.ports[portIndex].clear()
                        global.ports[portIndex].close()
                        selfLoad(portIndex)
                    })
                    return
                }
                case "reload": {
                    global.ports.forEach((port) => {
                        port.clear()
                        port.close()
                        selfLoad(port.portIndex)
                        return
                    })
                }
            }
        })
    })
}

module.exports = {
    iSocket
}