import { Server } from "socket.io";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  global.io = io;

  io.on("connection", socket => {
    console.log("Client connected");
  });
}
