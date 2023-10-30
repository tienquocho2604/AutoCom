const { Server } = require("socket.io")

const iSocket = () => {
    global.io = new Server(3000)
    global.defaultSocket
    let io = global.io
    io.on("connection", (socket) => {
        global.defaultSocket = socket
        setTimeout(() => {
            io.emit("LOAD_PORTS", global.ports.map((port) => {
                return port.useable()
            }))
        }, 3000)
        let interval = setInterval(() => {
            io.emit("LOAD_PORTS", global.ports.map((port) => {
                return port.useable()
            }))
        }, 3000)
    })
}

module.exports = {
    iSocket
}