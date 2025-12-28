import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { redis } from "../config/redis";

// ===============================
// CREATE NOTE
// ===============================
export async function createNote(req: Request, res: Response) {
  try {
    const { title, content } = req.body;
    const userId = (req as any).user.userId;

    if (typeof title !== "string" || typeof content !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        ownerId: userId,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Failed to create note" });
  }
}

// ===============================
// GET NOTE (REDIS CACHED)
// ===============================
export async function getNote(req: Request, res: Response) {
  try {
    const noteId = req.params.id;
    const cacheKey = `note:${noteId}`;

    // Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await redis.set(cacheKey, JSON.stringify(note), "EX", 60);

    res.json(note);
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ message: "Failed to fetch note" });
  }
}

// ===============================
// UPDATE NOTE (AUTOSAVE-SAFE)
// ===============================
export async function updateNote(req: Request, res: Response) {
  try {
    const noteId = req.params.id;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    // ✅ Allow empty string, reject non-string
    if (typeof content !== "string") {
      return res.status(400).json({ message: "Invalid content" });
    }

    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (existingNote.ownerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Authoritative update
    await prisma.note.update({
      where: { id: noteId },
      data: { content },
    });

    // Snapshot for version history
    await prisma.noteVersion.create({
      data: {
        noteId,
        content,
      },
    });

    // Cache invalidation
    await redis.del(`note:${noteId}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Failed to update note" });
  }
}
