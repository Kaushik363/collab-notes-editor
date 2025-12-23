import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createNote,
  getNote,
  updateNote,
} from "../controllers/note.controller";

const router = Router();

router.post("/", authMiddleware, createNote);
router.get("/:id", authMiddleware, getNote);
router.put("/:id", authMiddleware, updateNote);

export default router;
