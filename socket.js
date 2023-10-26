const { Server } = require("socket.io")

const iSocket = () => {
    const io = new Server(3000)

    io.on("connection", (socket) => {
        setTimeout(() => {
            io.emit("LOAD_PORTS", global.ports)
        }, 3000)
        let interval = setInterval(() => {
            io.emit("PORTS", global.ports)
        }, 3000)
    })
}

module.exports = {
    iSocket
}