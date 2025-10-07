import { NextFunction, Request, Response } from "express";
import WishlistService from "../services/wishlist.service";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errors";

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for addToWishlist");
      throw new AuthenticationError("User not authenticated");
    }
    const { product } = req.body;
    const userId = res.locals.userId.toString();
    const data = await WishlistService.addToWishlist(userId, { product });
    logger.info("Product added to wishlist successfully", { userId, product });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error occurred in addToWishlist", { error: err });
    next(err);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for getWishlist");
      throw new AuthenticationError("User not authenticated");
    }
    const userId = res.locals.userId.toString();
    const data = await WishlistService.getWishlist(userId);
    logger.info("Wishlist retrieved successfully", { userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getWishlist", { error: err });
    next(err);
  }
};

export const removeWishlistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for removeWishlistItem");
      throw new AuthenticationError("User not authenticated");
    }
    const { itemId } = req.params;
    const userId = res.locals.userId.toString();
    const data = await WishlistService.removeWishlistItem(userId, itemId);
    logger.info("Item removed from wishlist successfully", { userId, itemId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in removeWishlistItem", { error: err });
    next(err);
  }
};