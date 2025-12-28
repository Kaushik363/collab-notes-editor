import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

interface JwtPayload {
  userId: number;
}

interface NoteUpdatePayload {
  noteId: string;
  content: string;
}

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3001",
      credentials: true,
    },
  });

  // ===============================
  // SOCKET AUTH MIDDLEWARE
  // ===============================
  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return next(new Error("No cookie"));

    const cookies = cookie.parse(rawCookie);
    const token = cookies.accessToken;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;

      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ===============================
  // CONNECTION
  // ===============================
  io.on("connection", (socket: Socket) => {
    console.log(
      "Socket connected:",
      socket.id,
      "User:",
      socket.data.userId
    );

    // Join note room
    socket.on("join-note", (noteId: string) => {
      if (!noteId) return;
      socket.join(noteId);
      console.log(`User ${socket.data.userId} joined note ${noteId}`);
    });

    // ===============================
    // NOTE UPDATE (SYNC ONLY)
    // ===============================
    socket.on(
      "note-update",
      ({ noteId, content }: NoteUpdatePayload) => {
        if (!noteId || typeof content !== "string") return;

        // 🔒 IMPORTANT:
        // - DO NOT save to DB here
        // - HTTP autosave is the authority
        // - Socket only mirrors state

        socket.to(noteId).emit("note-update", {
          content,
        });
      }
    );

    socket.on("disconnect", () => {
      console.log(
        "Socket disconnected:",
        socket.id,
        "User:",
        socket.data.userId
      );
    });
  });
}
