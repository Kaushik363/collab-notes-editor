import express from "express";
import cors from "cors";
import noteRoutes from "./routes/note.routes";
import versionRoutes from "./routes/version.routes";
import authRoutes from "./routes/auth.routes";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/versions", versionRoutes);
app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/notes", noteRoutes);
