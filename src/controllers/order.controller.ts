import { NextFunction, Request, Response } from "express";
import OrderService from "../services/order.service";
import logger from "../utils/logger";
import { AuthenticationError, BadRequestError } from "../utils/errors";

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

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for cancelOrder");
      throw new AuthenticationError("User not authenticated");
    }
    const { id } = req.params;
    const userId = res.locals.userId.toString();
    const userRole = res.locals.role || "user";

    const data = await OrderService.cancelOrder(id, userId, userRole);
    logger.info("Order cancelled successfully", { orderId: id, userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in cancelOrder", { error: err });
    next(err);
  }
};

export const requestReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) {
      logger.warn("User not authenticated for requestReturn");
      throw new AuthenticationError("User not authenticated");
    }
    const { id } = req.params;
    const { reason } = req.body; // Get reason from the request body
    const userId = res.locals.userId.toString();

    if (!reason) {
      throw new BadRequestError("A reason for the return is required.");
    }

    const data = await OrderService.requestReturn(id, userId, reason);
    logger.info("Order return requested successfully", { orderId: id, userId });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in requestReturn", { error: err });
    next(err);
  }
};

export const getAllOrdersForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.query;
    const data = await OrderService.getAllOrdersForAdmin({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    logger.info("All orders retrieved for admin");
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getAllOrdersForAdmin", { error: err });
    next(err);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // The admin check is handled by the 'restrictToAdmin' middleware in your route
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new BadRequestError("Status is required in the request body.");
    }

    const data = await OrderService.updateOrderStatus(orderId, status);
    logger.info("Order status updated by admin", {
      orderId,
      newStatus: status,
    });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error in updateOrderStatus controller", { error: err });
    next(err);
  }
};
