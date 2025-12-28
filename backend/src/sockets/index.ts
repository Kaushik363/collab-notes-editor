// import { Server as HttpServer } from "http";
// import { Server as SocketIOServer } from "socket.io";
// import jwt from "jsonwebtoken";
// import cookie from "cookie";

// interface JwtPayload {
//   userId: number;
// }

// let io: SocketIOServer;

// export function initSocket(server: HttpServer) {
//   io = new SocketIOServer(server, {
//     cors: {
//       origin: "http://localhost:3001",
//       credentials: true,
//     },
//   });

//   /**
//    * 🔐 SOCKET AUTH MIDDLEWARE (COOKIE-BASED)
//    */
//   io.use((socket, next) => {
//     try {
//       const rawCookie = socket.handshake.headers.cookie;

//       if (!rawCookie) {
//         return next(new Error("Unauthorized: no cookie"));
//       }

//       const cookies = cookie.parse(rawCookie);
//       const token = cookies.accessToken;

//       if (!token) {
//         return next(new Error("Unauthorized: missing accessToken"));
//       }

//       const payload = jwt.verify(
//         token,
//         process.env.JWT_SECRET!
//       ) as JwtPayload;

//       socket.data.userId = payload.userId;
//       next();
//     } catch {
//       next(new Error("Unauthorized: invalid token"));
//     }
//   });

//   /**
//    * ✅ AUTHENTICATED CONNECTION
//    */
//   io.on("connection", (socket) => {
//     console.log(
//       "Socket connected:",
//       socket.id,
//       "User:",
//       socket.data.userId
//     );

//     socket.on("join-note", (noteId: string) => {
//       if (!noteId) return;

//       socket.join(noteId);

//       console.log(
//         `User ${socket.data.userId} joined note ${noteId}`
//       );
//     });

//     socket.on(
//       "note-update",
//       ({ noteId, content }: { noteId: string; content: string }) => {
//         if (!noteId || typeof content !== "string") return;

//         socket.to(noteId).emit("note-update", {
//           noteId,
//           content,
//           userId: socket.data.userId,
//         });
//       }
//     );

//     socket.on("disconnect", () => {
//       console.log(
//         "Socket disconnected:",
//         socket.id,
//         "User:",
//         socket.data.userId
//       );
//     });
//   });
// }


import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie"; // ✅ FIXED IMPORT

interface JwtPayload {
  userId: number;
}

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3001",
      credentials: true,
    },
  });

  /**
   * 🔐 SOCKET AUTH MIDDLEWARE (DEBUG VERSION)
   * TEMPORARY — for visibility
   */
  io.use((socket, next) => {
    console.log("🔌 Incoming socket connection attempt");

    const rawCookie = socket.handshake.headers.cookie;
    console.log("🍪 Raw cookie:", rawCookie);

    if (!rawCookie) {
      console.error("❌ No cookie in socket handshake");
      return next(new Error("No cookie"));
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.accessToken;

    console.log("🔑 Token from cookie:", token);

    if (!token) {
      console.error("❌ No accessToken in cookie");
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;

      socket.data.userId = payload.userId;
      console.log("✅ Socket authenticated. User:", payload.userId);

      next();
    } catch (err) {
      console.error("❌ JWT verification failed", err);
      next(new Error("Invalid token"));
    }
  });

  /**
   * ✅ AUTHENTICATED CONNECTION
   */
  io.on("connection", (socket) => {
    console.log(
      "Socket connected:",
      socket.id,
      "User:",
      socket.data.userId
    );

    socket.on("join-note", (noteId: string) => {
      if (!noteId) return;

      socket.join(noteId);

      console.log(
        `User ${socket.data.userId} joined note ${noteId}`
      );
    });

    socket.on(
      "note-update",
      ({ noteId, content }: { noteId: string; content: string }) => {
        if (!noteId || typeof content !== "string") return;

        socket.to(noteId).emit("note-update", {
          noteId,
          content,
          userId: socket.data.userId,
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
