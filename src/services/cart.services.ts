import { MongooseError, Types } from "mongoose";
import cartModel from "../models/cart.model";
import productModel from "../models/product.model";
import userModel from "../models/user.model";
import { ValidationError, BadRequestError, NotFoundError } from "../utils/errors";
import logger from "../utils/logger";

interface AddToCartBody {
  product: string;
  quantity: number;
}

interface UpdateCartItemBody {
  quantity: number;
}


export default class CartService {
  static async addToCart(userId: string, body: AddToCartBody) {
    try {
      logger.info("Adding product to cart", { userId, product: body.product });

      // Validate input
      if (!body.product) {
        logger.warn("Product ID is required");
        throw new ValidationError("Product ID is required");
      }
      if (!body.quantity || body.quantity < 1) {
        logger.warn("Invalid quantity", { quantity: body.quantity });
        throw new ValidationError("Quantity must be at least 1");
      }
      if (!Types.ObjectId.isValid(body.product)) {
        logger.warn("Invalid product ID", { product: body.product });
        throw new BadRequestError("Invalid product ID");
      }

      // Validate user existence
      const userExists = await userModel.findById(userId).lean();
      if (!userExists) {
        logger.warn("User not found", { userId });
        throw new NotFoundError("User not found");
      }

      // Validate product existence and stock
      const product = await productModel
        .findOne({ _id: body.product, isActive: true })
        .lean();
      if (!product) {
        logger.warn("Product not found or inactive", { product: body.product });
        throw new NotFoundError("Product not found or inactive");
      }
      if (product.stock < body.quantity) {
        logger.warn("Insufficient stock", {
          product: body.product,
          stock: product.stock,
          requested: body.quantity,
        });
        throw new BadRequestError(
          `Insufficient stock for product: ${product.name}`
        );
      }

      // Find or create cart
      let cart = await cartModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!cart) {
        logger.info("Creating new cart for user", { userId });
        cart = await cartModel.create({
          user: userId,
          items: [{ product: body.product, quantity: body.quantity }],
        });
      } else {
        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
          (item) => item.product._id.toString() === body.product
        );
        if (existingItemIndex >= 0) {
          // Update quantity
          const newQuantity = cart.items[existingItemIndex].quantity + body.quantity;
          if (product.stock < newQuantity) {
            logger.warn("Insufficient stock for updated quantity", {
              product: body.product,
              stock: product.stock,
              requested: newQuantity,
            });
            throw new BadRequestError(
              `Insufficient stock for product: ${product.name}`
            );
          }
          await cartModel.findOneAndUpdate(
            { user: userId, "items.product": body.product },
            { $set: { "items.$.quantity": newQuantity } }
          );
        } else {
          // Add new product to cart
          await cartModel.findOneAndUpdate(
            { user: userId },
            { $push: { items: { product: body.product, quantity: body.quantity } } }
          );
        }
      }

      // Fetch updated cart
      const updatedCart = await cartModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!updatedCart) {
        logger.error("Updated cart not found after add/update", { userId });
        throw new NotFoundError("Cart not found after update");
      }

      logger.info("Product added to cart successfully", { userId, product: body.product });

      return {
        data: {
          _id: updatedCart._id,
          user: updatedCart.user,
          items: updatedCart.items,
          createdAt: updatedCart.createdAt,
          updatedAt: updatedCart.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in addToCart", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

   static async getCart(userId: string) {
    try {
      logger.info("Fetching cart for user", { userId });

      // Validate user existence
      const userExists = await userModel.findById(userId).lean();
      if (!userExists) {
        logger.warn("User not found", { userId });
        throw new NotFoundError("User not found");
      }

      // Fetch cart with populated fields
      const cart = await cartModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!cart) {
        logger.info("No cart found for user, returning empty cart", { userId });
        return {
          data: {
            user: { _id: userId, username: userExists.username },
            items: [],
            createdAt: null,
            updatedAt: null,
          },
        };
      }

      logger.info("Cart retrieved successfully", { userId, cartId: cart._id });

      return {
        data: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in getCart", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid query");
      }
      throw err;
    }
  }

   static async updateCartItemQuantity(userId: string, itemId: string, body: UpdateCartItemBody) {
    try {
      logger.info("Updating cart item quantity", { userId, itemId, quantity: body.quantity });

      // Validate input
      if (!body.quantity || body.quantity < 1) {
        logger.warn("Invalid quantity", { quantity: body.quantity });
        throw new ValidationError("Quantity must be at least 1");
      }
      if (!Types.ObjectId.isValid(itemId)) {
        logger.warn("Invalid item ID", { itemId });
        throw new BadRequestError("Invalid item ID");
      }

      // Validate user existence
      const userExists = await userModel.findById(userId).lean();
      if (!userExists) {
        logger.warn("User not found", { userId });
        throw new NotFoundError("User not found");
      }

      // Find cart
      const cart = await cartModel.findOne({ user: userId }).lean();
      if (!cart) {
        logger.warn("Cart not found", { userId });
        throw new NotFoundError("Cart not found");
      }

      // Check if item exists in cart
      const item = cart.items.find((item) => item.product.toString() === itemId);
      if (!item) {
        logger.warn("Item not found in cart", { userId, itemId });
        throw new NotFoundError("Item not found in cart");
      }

      // Validate product existence and stock
      const product = await productModel
        .findOne({ _id: itemId, isActive: true })
        .lean();
      if (!product) {
        logger.warn("Product not found or inactive", { product: itemId });
        throw new NotFoundError("Product not found or inactive");
      }
      if (product.stock < body.quantity) {
        logger.warn("Insufficient stock", {
          product: itemId,
          stock: product.stock,
          requested: body.quantity,
        });
        throw new BadRequestError(
          `Insufficient stock for product: ${product.name}`
        );
      }

      // Update item quantity
      await cartModel.findOneAndUpdate(
        { user: userId, "items.product": itemId },
        { $set: { "items.$.quantity": body.quantity } }
      );

      // Fetch updated cart
      const updatedCart = await cartModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!updatedCart) {
        logger.error("Updated cart not found after updating item quantity", { userId, itemId });
        throw new NotFoundError("Cart not found after updating item quantity");
      }

      logger.info("Cart item quantity updated successfully", { userId, itemId });

      return {
        data: {
          _id: updatedCart._id,
          user: updatedCart.user,
          items: updatedCart.items,
          createdAt: updatedCart.createdAt,
          updatedAt: updatedCart.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in updateCartItemQuantity", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

   static async removeCartItem(userId: string, itemId: string) {
    try {
      logger.info("Removing item from cart", { userId, itemId });

      // Validate input
      if (!Types.ObjectId.isValid(itemId)) {
        logger.warn("Invalid item ID", { itemId });
        throw new BadRequestError("Invalid item ID");
      }

      // Validate user existence
      const userExists = await userModel.findById(userId).lean();
      if (!userExists) {
        logger.warn("User not found", { userId });
        throw new NotFoundError("User not found");
      }

      // Find cart
      const cart = await cartModel.findOne({ user: userId }).lean();
      if (!cart) {
        logger.warn("Cart not found", { userId });
        throw new NotFoundError("Cart not found");
      }

      // Check if item exists in cart
      const item = cart.items.find((item) => item.product.toString() === itemId);
      if (!item) {
        logger.warn("Item not found in cart", { userId, itemId });
        throw new NotFoundError("Item not found in cart");
      }

      // Remove item from cart
      await cartModel.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: itemId } } }
      );

      // Fetch updated cart
      const updatedCart = await cartModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      logger.info("Item removed from cart successfully", { userId, itemId });

      if (!updatedCart) {
        return {
          data: {
            user: { _id: userId, username: userExists.username },
            items: [],
            createdAt: null,
            updatedAt: null,
          },
        };
      }

      return {
        data: {
          _id: updatedCart._id,
          user: updatedCart.user,
          items: updatedCart.items,
          createdAt: updatedCart.createdAt,
          updatedAt: updatedCart.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in removeCartItem", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }
}