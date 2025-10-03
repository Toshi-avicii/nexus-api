import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errors";
import userModel from "../models/user.model";
import UserService from "../services/user.service";
import { UpdateUserBody } from "../types/user";
import { UserAddress } from "../types/auth";

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
        addresses: user.addresses,
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

   const { username, email, isActive } = req.body as UpdateUserBody;
    const data = await UserService.updateUser(userId, {
      username,
      email,
      isActive, // Pass it to the service
    });
    logger.info("User profile updated successfully", { userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateMe", { error: err });
    next(err);
  }
};

export const addUserAddress = async (
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

    const { street, city, state, country, postalCode } =
      req.body as UserAddress;
    const data = await UserService.addUserAddress(userId, {
      street,
      city,
      state,
      country,
      postalCode,
    });
    logger.info("User address added successfully", { userId });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error occurred in addUserAddress", { error: err });
    next(err);
  }
};

export const updateUserAddress = async (
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

    const { addressId } = req.params;
    const { street, city, state, country, postalCode } =
      req.body as UserAddress;
    const data = await UserService.updateUserAddress(userId, addressId, {
      street,
      city,
      state,
      country,
      postalCode,
    });
    logger.info("User address updated successfully", { userId, addressId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateUserAddress", { error: err });
    next(err);
  }
};

export const deleteUserAddress = async (
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

    const { addressId } = req.params;
    const data = await UserService.deleteUserAddress(userId, addressId);
    logger.info("User address deleted successfully", { userId, addressId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in deleteUserAddress", { error: err });
    next(err);
  }
};

export const deleteUser = async (
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

    const data = await UserService.deleteUser(userId);
    logger.info("User account deactivated successfully", { userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in deleteUser", { error: err });
    next(err);
  }
};
