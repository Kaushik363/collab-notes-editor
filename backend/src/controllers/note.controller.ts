import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { redis } from "../config/redis";

//create note
export async function createNote(req: Request, res: Response) {
  try {
    const { title, content } = req.body;
    const userId = (req as any).user.userId;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
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

// get note from redis
export async function getNote(req: Request, res: Response) {
  try {
    const noteId = req.params.id;
    const cacheKey = `note:${noteId}`;

    // check redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Redis cache hit");
      return res.json(JSON.parse(cached));
    }

    // get from db
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // add to cache(redis)
    await redis.set(cacheKey, JSON.stringify(note), "EX", 60);

    res.json(note);
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ message: "Failed to fetch note" });
  }
}

//update note
export async function updateNote(req: Request, res: Response) {
  try {
    const noteId = req.params.id;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
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

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { content },
    });

    await prisma.noteVersion.create({
      data: {
        noteId,
        content,
      },
    });

    await redis.del(`note:${noteId}`);

    res.json(updatedNote);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Failed to update note" });
  }
}
