import { MongooseError, Types } from "mongoose";
import orderModel from "../models/order.model";
import productModel from "../models/product.model";
import userModel from "../models/user.model";
import { ValidationError, BadRequestError, NotFoundError, AuthenticationError } from "../utils/errors";
import logger from "../utils/logger";

interface CreateOrderBody {
  user: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  payment?: string;
}

interface GetUserOrdersQuery {
  page?: number;
  limit?: number;
}

export default class OrderService {
  static async createOrder(body: CreateOrderBody) {
    try {
      // Validate input
      if (!body.user) {
        logger.warn("User is required");
        throw new ValidationError("User is required");
      }
      if (!body.items || body.items.length === 0) {
        logger.warn("At least one item is required");
        throw new ValidationError("At least one item is required");
      }

      // Validate user existence
      const userExists = await userModel.findById(body.user).lean();
      if (!userExists) {
        logger.warn("User not found", { user: body.user });
        throw new BadRequestError("User not found");
      }

      // Validate items and products
      const productIds = body.items.map((item) => item.product);
      const products = await productModel
        .find({ _id: { $in: productIds }, isActive: true })
        .lean();
      if (products.length !== productIds.length) {
        logger.warn("One or more products not found or inactive", {
          productIds,
        });
        throw new BadRequestError("One or more products not found or inactive");
      }

      // Validate quantities and prices, and check stock
      for (const item of body.items) {
        if (item.quantity < 1) {
          logger.warn("Invalid quantity", { product: item.product });
          throw new ValidationError("Quantity must be at least 1");
        }
        if (item.price < 0) {
          logger.warn("Invalid price", { product: item.product });
          throw new ValidationError("Price cannot be negative");
        }
        const product = products.find((p) => p._id.toString() === item.product);
        if (!product) {
          logger.warn("Product not found", { product: item.product });
          throw new BadRequestError("Product not found");
        }
        if (product.stock < item.quantity) {
          logger.warn("Insufficient stock", {
            product: item.product,
            stock: product.stock,
            requested: item.quantity,
          });
          throw new BadRequestError(
            `Insufficient stock for product: ${product.name}`
          );
        }
      }

      // Validate shipping address if provided
      if (body.shippingAddress) {
        const { street, city, state, country, postalCode } = body.shippingAddress;
        if (street && street.length > 100) {
          throw new ValidationError("Street must not exceed 100 characters");
        }
        if (city && city.length > 50) {
          throw new ValidationError("City must not exceed 50 characters");
        }
        if (state && state.length > 50) {
          throw new ValidationError("State must not exceed 50 characters");
        }
        if (country && country.length > 50) {
          throw new ValidationError("Country must not exceed 50 characters");
        }
        if (postalCode && postalCode.length > 20) {
          throw new ValidationError("Postal code must not exceed 20 characters");
        }
      }

      // Calculate total amount
      const totalAmount = body.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      // Create order
      logger.info("Creating new order", { user: body.user });
      const newOrder = await orderModel.create({
        user: body.user,
        items: body.items,
        totalAmount,
        shippingAddress: body.shippingAddress,
        payment: body.payment,
        status: "pending",
      });

      // Update product stock
      await Promise.all(
        body.items.map(async (item) => {
          await productModel.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        })
      );

      // Populate user and product details for response
      const populatedOrder = await orderModel
        .findById(newOrder._id)
        .populate("user", "name")
        .populate("items.product", "name price")
        .lean();

      if (!populatedOrder) {
        logger.error("Order not found after creation", { orderId: newOrder._id });
        throw new BadRequestError("Order not found after creation");
      }

      logger.info("Order created successfully", {
        orderId: newOrder._id,
        user: body.user,
      });

      return {
        data: {
          _id: populatedOrder._id,
          user: populatedOrder.user,
          items: populatedOrder.items,
          totalAmount: populatedOrder.totalAmount,
          status: populatedOrder.status,
          shippingAddress: populatedOrder.shippingAddress,
          payment: populatedOrder.payment,
          createdAt: populatedOrder.createdAt,
          updatedAt: populatedOrder.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in createOrder", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

   static async getUserOrders(userId: string, query: GetUserOrdersQuery) {
    try {
      logger.info("Fetching orders for user", { userId, query });

      // Validate user existence
      const userExists = await userModel.findById(userId).lean();
      if (!userExists) {
        logger.warn("User not found", { userId });
        throw new BadRequestError("User not found");
      }

      // Pagination
      const page = query.page ? parseInt(query.page.toString(), 10) : 1;
      const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;
      const skip = (page - 1) * limit;

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        logger.warn("Invalid pagination parameters", { page, limit });
        throw new ValidationError("Page and limit must be positive numbers");
      }

      // Fetch orders and total count
      const [orders, total] = await Promise.all([
        orderModel
          .find({ user: userId })
          .skip(skip)
          .limit(limit)
          .populate("user", "name")
          .populate("items.product", "name price")
          .lean(),
        orderModel.countDocuments({ user: userId }),
      ]);

      logger.info("Orders retrieved successfully", {
        userId,
        count: orders.length,
        total,
      });

      return {
        data: orders.map((order) => ({
          _id: order._id,
          user: order.user,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          payment: order.payment,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      logger.error("Error in getUserOrders", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid query parameters");
      }
      throw err;
    }
  }

  static async getOrderById(orderId: string, userId: string, userRole: string) {
    try {
      logger.info("Fetching order by ID", { orderId, userId, userRole });

      // Validate orderId
      if (!Types.ObjectId.isValid(orderId)) {
        logger.warn("Invalid order ID", { orderId });
        throw new BadRequestError("Invalid order ID");
      }

      // Fetch order with populated fields
      const order = await orderModel
        .findById(orderId)
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!order) {
        logger.warn("Order not found", { orderId });
        throw new NotFoundError("Order not found");
      }

      // Check access permissions
      if (userRole !== "admin" && order.user._id.toString() !== userId) {
        logger.warn("Unauthorized access to order", { orderId, userId });
        throw new AuthenticationError("Unauthorized to view this order");
      }

      logger.info("Order retrieved successfully", { orderId, userId });

      return {
        data: {
          _id: order._id,
          user: order.user,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          payment: order.payment,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in getOrderById", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid order ID");
      }
      throw err;
    }
  }
}