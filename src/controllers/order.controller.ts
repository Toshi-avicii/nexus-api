import { NextFunction, Request, Response } from "express";
import OrderService from "../services/order.service";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errors";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, items, shippingAddress, payment } = req.body;
    const data = await OrderService.createOrder({
      user,
      items,
      shippingAddress,
      payment,
    });
    logger.info("Order created successfully", { orderId: data.data._id });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error occurred in createOrder", { error: err });
    next(err);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
        console.log({ userId: res.locals.userId });
      logger.warn("User not authenticated for getUserOrders");
      throw new AuthenticationError("User not authenticated");
    }
    const userId = res.locals.userId.toString(); // Convert to string for consistency
    logger.debug("Fetching orders for user", { userId }); // Debug log
    const { page, limit } = req.query;
    const data = await OrderService.getUserOrders(userId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    logger.info("User orders retrieved successfully", { userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getUserOrders", { error: err });
    next(err);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for getOrderById");
      throw new AuthenticationError("User not authenticated");
    }
    const { id } = req.params;
    const userId = res.locals.userId.toString();
    const userRole = res.locals.role || "user";
    const data = await OrderService.getOrderById(id, userId, userRole);
    logger.info("Order retrieved successfully", { orderId: id, userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getOrderById", { error: err });
    next(err);
  }
};