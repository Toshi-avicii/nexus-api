import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { AuthenticationError } from "../utils/errors";
import logger from "../utils/logger";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    throw new AuthenticationError("Invalid token");
  }
};

export const restrictToAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    logger.warn("Access denied: Admin role required", { userId: user?.userId });
    throw new AuthenticationError("Access denied: Admin role required");
  }
  logger.info("Admin access granted", { userId: user.userId });
  next();
};
