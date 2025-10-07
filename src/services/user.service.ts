import { MongooseError, Types } from "mongoose";
import userModel from "../models/user.model";
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import jwt from "jsonwebtoken";
import config from "../config";
import logger from "../utils/logger";
import { UpdateUserBody } from "../types/user";
import bcrypt from "bcryptjs";
import { UserAddress } from "../types/auth";

export default class UserService {
  static async updateUser(userId: string, body: UpdateUserBody) {
    try {
      // Validate input
      if (
        !body.username &&
        !body.email &&
        typeof body.isActive === "undefined"
      ) {
        logger.warn("No fields provided for update", { userId });
        throw new ValidationError(
          "At least one field (username, email, isActive) must be provided"
        );
      }

      // Prepare update object
      const update: Partial<UpdateUserBody> = {};
      if (body.username) {
        update.username = body.username.trim();
        if (update.username.length < 3 || update.username.length > 20) {
          throw new ValidationError(
            "Username must be between 3 and 20 characters"
          );
        }
      }
      if (body.email) {
        update.email = body.email.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
          throw new ValidationError("Please enter a valid email address");
        }
        // Check if email is already taken by another user
        const existingUser = await userModel.findOne({
          email: update.email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          logger.warn("Email already in use", { email: update.email });
          throw new BadRequestError("Email already in use by another user");
        }
      }

      if (typeof body.isActive === "boolean") {
        update.isActive = body.isActive;
      }

      logger.info("Updating user profile", { userId, update });
      const user = await userModel.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true, runValidators: true }
      );
      if (!user) {
        logger.warn("User not found or inactive", { userId });
        throw new AuthenticationError("User not found or inactive");
      }

      logger.info("User profile updated successfully", { email: user.email });
      return {
        data: {
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
      };
    } catch (err) {
      logger.error("Error in updateUser", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async addUserAddress(userId: string, body: UserAddress) {
    try {
      logger.info("Adding user address", { userId });

      // Validate input
      const { street, city, state, country, postalCode } = body;
      if (!street || !city || !state || !country || !postalCode) {
        logger.warn("Missing address fields", { userId, body });
        throw new ValidationError(
          "All address fields (street, city, state, country, postalCode) are required"
        );
      }
      if (street.length > 120) {
        throw new ValidationError("Street name must not exceed 120 characters");
      }
      if (city.length > 50) {
        throw new ValidationError("City name must not exceed 50 characters");
      }
      if (state.length > 35) {
        throw new ValidationError("State name must not exceed 35 characters");
      }
      if (country.length > 120) {
        throw new ValidationError(
          "Country name must not exceed 120 characters"
        );
      }
      if (postalCode.length > 6) {
        throw new ValidationError("Postal code must not exceed 6 characters");
      }

      // Validate user existence
      const user = await userModel.findById(userId);
      if (!user) {
        logger.warn("User not found or inactive", { userId });
        throw new NotFoundError("User not found or inactive");
      }

      // Add new address
      const newAddress = {
        _id: new Types.ObjectId(),
        street,
        city,
        state,
        country,
        postalCode,
      };

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $push: { addresses: newAddress } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        logger.warn("User not found after address addition", { userId });
        throw new NotFoundError("User not found after address addition");
      }

      logger.info("User address added successfully", {
        userId,
        email: updatedUser.email,
      });

      return {
        data: {
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          addresses: updatedUser.addresses,
        },
      };
    } catch (err) {
      logger.error("Error in addUserAddress", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async updateUserAddress(
    userId: string,
    addressId: string,
    body: UserAddress
  ) {
    try {
      logger.info("Updating user address", { userId, addressId });

      // Validate input
      const { street, city, state, country, postalCode } = body;
      if (!street || !city || !state || !country || !postalCode) {
        logger.warn("Missing address fields", { userId, body });
        throw new ValidationError(
          "All address fields (street, city, state, country, postalCode) are required"
        );
      }
      if (street.length > 120) {
        throw new ValidationError("Street name must not exceed 120 characters");
      }
      if (city.length > 50) {
        throw new ValidationError("City name must not exceed 50 characters");
      }
      if (state.length > 35) {
        throw new ValidationError("State name must not exceed 35 characters");
      }
      if (country.length > 120) {
        throw new ValidationError(
          "Country name must not exceed 120 characters"
        );
      }
      if (postalCode.length > 6) {
        throw new ValidationError("Postal code must not exceed 6 characters");
      }

      // Validate user existence
      const user = await userModel.findById(userId);
      if (!user) {
        logger.warn("User not found or inactive", { userId });
        throw new NotFoundError("User not found or inactive");
      }

      // Update specific address
      const updatedUser = await userModel.findOneAndUpdate(
        { _id: userId, "addresses._id": addressId },
        {
          $set: {
            "addresses.$.street": street,
            "addresses.$.city": city,
            "addresses.$.state": state,
            "addresses.$.country": country,
            "addresses.$.postalCode": postalCode,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        logger.warn("Address not found", { userId, addressId });
        throw new NotFoundError("Address not found");
      }

      logger.info("User address updated successfully", {
        userId,
        addressId,
        email: updatedUser.email,
      });

      return {
        data: {
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          addresses: updatedUser.addresses,
        },
      };
    } catch (err) {
      logger.error("Error in updateUserAddress", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async deleteUserAddress(userId: string, addressId: string) {
    try {
      logger.info("Deleting user address", { userId, addressId });

      // Validate user existence
      const user = await userModel.findById(userId);
      if (!user) {
        logger.warn("User not found or inactive", { userId });
        throw new NotFoundError("User not found or inactive");
      }

      // Delete specific address
      const updatedUser = await userModel.findOneAndUpdate(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        logger.warn("Address not found", { userId, addressId });
        throw new NotFoundError("Address not found");
      }

      logger.info("User address deleted successfully", {
        userId,
        addressId,
        email: updatedUser.email,
      });

      return {
        data: {
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          addresses: updatedUser.addresses,
        },
      };
    } catch (err) {
      logger.error("Error in deleteUserAddress", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async deleteUser(userId: string) {
    try {
      logger.info("Deleting user account", { userId });

      // Validate user existence
      const user = await userModel.findById(userId);
      if (!user) {
        logger.warn("User not found", { userId });
        throw new NotFoundError("User not found");
      }

      // Delete user
      await userModel.findByIdAndDelete(userId);

      logger.info("User account deleted successfully", {
        userId,
        email: user.email,
      });

      return {
        message: "Account deleted successfully",
      };
    } catch (err) {
      logger.error("Error in deleteUser", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async getAllUsersForAdmin(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      userModel
        .find({}) // Find all users
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -forgotPasswordToken") // Exclude sensitive fields
        .lean(),
      userModel.countDocuments({}),
    ]);

    return {
      message: "All users retrieved successfully.",
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUserByAdmin(
    userId: string,
    body: { role?: "user" | "admin"; isActive?: boolean }
  ) {
    const { role, isActive } = body;

    // Build update object to only include provided fields
    const update: { role?: string; isActive?: boolean } = {};
    if (role) {
      if (role !== "user" && role !== "admin") {
        throw new BadRequestError("Invalid role specified.");
      }
      update.role = role;
    }
    if (typeof isActive === "boolean") {
      update.isActive = isActive;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestError(
        "At least one field (role, isActive) must be provided."
      );
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select("-password -forgotPasswordToken");

    if (!updatedUser) {
      throw new NotFoundError("User not found.");
    }

    return {
      message: "User updated by admin successfully.",
      data: updatedUser,
    };
  }
}
