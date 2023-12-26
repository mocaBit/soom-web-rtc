const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket) => {
    socket.emit("meetId", socket.id)

    socket.on("joinMeet", ({ from, to, signal }) => {
        io.to(to).emit("joinMeet", { signal, from })
    })

    socket.on("acceptRequest", ({ to, signal }) => {
        io.to(to).emit("acceptRequest", signal)
    })

    socket.on("disconnect", () => {
        socket.broadcast.emit("meetEnd")
    })
})

server.listen(3001, () => console.log("server is running on port 3001"))