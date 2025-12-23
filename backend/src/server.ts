import http from "http";
import { app } from "./app";
import { prisma } from "./prisma/client";
import { redis } from "./config/redis";
import { initSocket } from "./sockets";

const PORT = 3000;

async function start() {
  await prisma.$connect();
  console.log("Database connected");

  const pong = await redis.ping();
  console.log("Redis connected:", pong);

  // 🔥 IMPORTANT: create HTTP server
  const server = http.createServer(app);

  // 🔥 IMPORTANT: initialize socket.io
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
