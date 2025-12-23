import { Router } from "express";
import { prisma } from "../prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:noteId", authMiddleware, async (req, res) => {
  const versions = await prisma.noteVersion.findMany({
    where: { noteId: req.params.noteId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  res.json(versions);
});

export default router;
