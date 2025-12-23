import { app } from "./app";
import { prisma } from "./prisma/client";
import { redis } from "./config/redis";

const PORT = 3000;

async function start() {
  await prisma.$connect();
  console.log("Database connected");

  const pong = await redis.ping();
  console.log("Redis connected:", pong);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
