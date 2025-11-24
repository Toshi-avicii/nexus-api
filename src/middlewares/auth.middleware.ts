import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { AuthenticationError, ForbiddenError, TokenExpiredError } from "../utils/errors";
import logger from "../utils/logger";
import { CustomJWTPayload } from "../types/general";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next(new AuthenticationError("Access token missing"));
  }

  try {
    const decoded = jwt.verify(accessToken, config.accessTokenSecret as string) as CustomJWTPayload;
    (req as any).user = decoded;
    res.locals.userId = decoded.userId;
    next();
  } catch (error: any) {
    // Token expired or invalid
    if (error.name === "TokenExpiredError") {
      return next(new TokenExpiredError("Access Token Expired"))
    }
    // return res.status(403).json({ message: "Invalid access token" });
    return next(new ForbiddenError("Invalid Access Token"));
  }
};

export const restrictToAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  console.log({ user });
  if (!user || user.role !== "admin") {
    logger.warn("Access denied: Admin role required", { userId: user?.userId });
    throw new AuthenticationError("Access denied: Admin role required");
  }
  logger.info("Admin access granted", { userId: user.userId });
  next();
};
