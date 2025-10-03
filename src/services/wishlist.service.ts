import { MongooseError, Types } from "mongoose";
import wishlistModel from "../models/wishlist.model";
import productModel from "../models/product.model";
import userModel from "../models/user.model";
import { ValidationError, BadRequestError, NotFoundError } from "../utils/errors";
import logger from "../utils/logger";

interface AddToWishlistBody {
  product: string;
}

export default class WishlistService {
  static async addToWishlist(userId: string, body: AddToWishlistBody) {
    try {
      logger.info("Adding product to wishlist", { userId, product: body.product });

      // Validate input
      if (!body.product) {
        logger.warn("Product ID is required");
        throw new ValidationError("Product ID is required");
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

      // Validate product existence
      const product = await productModel
        .findOne({ _id: body.product, isActive: true })
        .lean();
      if (!product) {
        logger.warn("Product not found or inactive", { product: body.product });
        throw new NotFoundError("Product not found or inactive");
      }

      // Find or create wishlist
      let wishlist = await wishlistModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!wishlist) {
        logger.info("Creating new wishlist for user", { userId });
        wishlist = await wishlistModel.create({
          user: userId,
          items: [{ product: body.product }],
        });
      } else {
        // Check if product already exists in wishlist
        const itemExists = wishlist.items.some(
          (item) => item.product._id.toString() === body.product
        );
        if (itemExists) {
          logger.info("Product already in wishlist", { userId, product: body.product });
          return {
            data: {
              _id: wishlist._id,
              user: wishlist.user,
              items: wishlist.items,
              createdAt: wishlist.createdAt,
              updatedAt: wishlist.updatedAt,
            },
          };
        }

        // Add new product to wishlist
        await wishlistModel.findOneAndUpdate(
          { user: userId },
          { $push: { items: { product: body.product } } }
        );
      }

      // Fetch updated wishlist
      const updatedWishlist = await wishlistModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!updatedWishlist) {
        logger.error("Updated wishlist not found after adding product", { userId, product: body.product });
        throw new NotFoundError("Wishlist not found after update");
      }

      logger.info("Product added to wishlist successfully", { userId, product: body.product });

      return {
        data: {
          _id: updatedWishlist._id,
          user: updatedWishlist.user,
          items: updatedWishlist.items,
          createdAt: updatedWishlist.createdAt,
          updatedAt: updatedWishlist.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in addToWishlist", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

   static async getWishlist(userId: string) {
    try {
      logger.info("Fetching wishlist for user", { userId });

      // Validate user existence
      const userExists = await userModel.findById(userId).lean();
      if (!userExists) {
        logger.warn("User not found", { userId });
        throw new NotFoundError("User not found");
      }

      // Fetch wishlist with populated fields
      const wishlist = await wishlistModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      if (!wishlist) {
        logger.info("No wishlist found for user, returning empty wishlist", { userId });
        return {
          data: {
            user: { _id: userId, username: userExists.username },
            items: [],
            createdAt: null,
            updatedAt: null,
          },
        };
      }

      logger.info("Wishlist retrieved successfully", { userId, wishlistId: wishlist._id });

      return {
        data: {
          _id: wishlist._id,
          user: wishlist.user,
          items: wishlist.items,
          createdAt: wishlist.createdAt,
          updatedAt: wishlist.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in getWishlist", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid query");
      }
      throw err;
    }
  }

   static async removeWishlistItem(userId: string, itemId: string) {
    try {
      logger.info("Removing item from wishlist", { userId, itemId });

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

      // Find wishlist
      const wishlist = await wishlistModel.findOne({ user: userId }).lean();
      if (!wishlist) {
        logger.warn("Wishlist not found", { userId });
        throw new NotFoundError("Wishlist not found");
      }

      // Check if item exists in wishlist
      const item = wishlist.items.find((item) => item.product.toString() === itemId);
      if (!item) {
        logger.warn("Item not found in wishlist", { userId, itemId });
        throw new NotFoundError("Item not found in wishlist");
      }

      // Remove item from wishlist
      await wishlistModel.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: itemId } } }
      );

      // Fetch updated wishlist
      const updatedWishlist = await wishlistModel
        .findOne({ user: userId })
        .populate("user", "username")
        .populate("items.product", "name price")
        .lean();

      logger.info("Item removed from wishlist successfully", { userId, itemId });

      if (!updatedWishlist) {
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
          _id: updatedWishlist._id,
          user: updatedWishlist.user,
          items: updatedWishlist.items,
          createdAt: updatedWishlist.createdAt,
          updatedAt: updatedWishlist.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in removeWishlistItem", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }
}