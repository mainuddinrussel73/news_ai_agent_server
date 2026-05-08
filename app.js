import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import setupRoutes from "./api/routes.js";

const app = express();
const server = http.createServer(app);

// 🔥 MUST BE FIRST (before routes)
app.use(cors({
   origin: "*",   
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// socket
const io = new Server(server, {
  cors: {
     origin: "*",   
    methods: ["GET", "POST"]
  }
});

// routes
app.use("/api", setupRoutes(io));

io.on("connection", () => {
  console.log("Client connected");
});

// 🔥 Render PORT fix (VERY IMPORTANT)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
