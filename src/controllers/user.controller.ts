import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errors";
import userModel from "../models/user.model";
import UserService from "../services/user.service";
import { UpdateUserBody } from "../types/user";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.userId;
    // console.log(userId);

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new AuthenticationError("User not found or inactive");
    }

    logger.info("User fetched successfully", {
      email: user.email,
    });
    res.status(200).json({
      data: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("Error occurred in getMe", {
      error: err,
    });
    next(err);
  }
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      logger.warn("No userId in JWT payload");
      throw new AuthenticationError("User not authenticated");
    }

    const { username, email } = req.body as UpdateUserBody;
    const data = await UserService.updateUser(userId, {
      username,
      email
    });
    logger.info("User profile updated successfully", { userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateMe", { error: err });
    next(err);
  }
};
