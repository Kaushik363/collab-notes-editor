import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a note room
    socket.on("join-note", (noteId: string) => {
      socket.join(noteId);

      console.log(`Socket ${socket.id} joined note ${noteId}`);

      // Presence message
      socket.to(noteId).emit("presence", "Another user joined");
    });

    // 🔥 HANDLE NOTE UPDATES
    socket.on(
      "note-update",
      ({ noteId, content }: { noteId: string; content: string }) => {
        // Broadcast to everyone EXCEPT sender
        socket.to(noteId).emit("note-update", content);
      }
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
