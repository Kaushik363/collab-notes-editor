import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_WS_URL as string,
  {
    autoConnect: false,
  }
);

console.log("WS URL:", process.env.NEXT_PUBLIC_WS_URL);
