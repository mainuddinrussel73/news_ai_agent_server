import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import setupRoutes from "./api/routes.js";

const app = express();
const server = http.createServer(app);

// 🔥 MUST BE FIRST (before routes)
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// socket
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// routes
app.use("/api", setupRoutes(io));

io.on("connection", () => {
  console.log("Client connected");
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});
