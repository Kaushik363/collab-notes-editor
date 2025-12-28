import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import noteRoutes from "./routes/note.routes";
import versionRoutes from "./routes/version.routes";
import authRoutes from "./routes/auth.routes";

export const app = express();


app.use(
  cors({
    origin: "http://localhost:3001", // frontend URL
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/versions", versionRoutes);
app.use("/notes", noteRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
