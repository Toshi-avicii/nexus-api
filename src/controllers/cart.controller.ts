import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errors";
import CartService from "../services/cart.services";
import { CartInput, UpdateCartItemQuantityInput } from "../types/cart";

export const addToCart = async (
  req: Request<{}, {}, CartInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for addToCart");
      throw new AuthenticationError("User not authenticated");
    }
    const { product, quantity } = req.body;
    const userId = res.locals.userId.toString();
    const data = await CartService.addToCart(userId, { product, quantity });
    logger.info("Product added to cart successfully", { userId, product });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error occurred in addToCart", { error: err });
    next(err);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for getCart");
      throw new AuthenticationError("User not authenticated");
    }
    const userId = res.locals.userId.toString();
    const data = await CartService.getCart(userId);
    logger.info("Cart retrieved successfully", { userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getCart", { error: err });
    next(err);
  }
};

export const updateCartItemQuantity = async (
  req: Request<{ itemId: string }, {}, UpdateCartItemQuantityInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for updateCartItemQuantity");
      throw new AuthenticationError("User not authenticated");
    }
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = res.locals.userId.toString();
    const data = await CartService.updateCartItemQuantity(userId, itemId, { quantity });
    logger.info("Cart item quantity updated successfully", { userId, itemId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateCartItemQuantity", { error: err });
    next(err);
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for removeCartItem");
      throw new AuthenticationError("User not authenticated");
    }
    const { itemId } = req.params;
    const userId = res.locals.userId.toString();
    const data = await CartService.removeCartItem(userId, itemId);
    logger.info("Item removed from cart successfully", { userId, itemId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in removeCartItem", { error: err });
    next(err);
  }
};