import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number };

    (req as any).user = { userId: decoded.userId }; // 🔒 FIX
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
