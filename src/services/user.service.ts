import { MongooseError } from "mongoose";
import userModel from "../models/user.model";
import {
  AuthenticationError,
  BadRequestError,
  ValidationError,
} from "../utils/errors";
import jwt from "jsonwebtoken";
import config from "../config";
import logger from "../utils/logger";
import { UpdateUserBody } from "../types/user";
import bcrypt from 'bcryptjs';

export default class UserService {

  static async updateUser(userId: string, body: UpdateUserBody) {
    try {
      // Validate input
      if (!body.username && !body.email) {
        logger.warn("No fields provided for update", { userId });
        throw new ValidationError("At least one field (username, email, or password) must be provided");
      }

      // Prepare update object
      const update: Partial<UpdateUserBody> = {};
      if (body.username) {
        update.username = body.username.trim();
        if (update.username.length < 3 || update.username.length > 20) {
          throw new ValidationError("Username must be between 3 and 20 characters");
        }
      }
      if (body.email) {
        update.email = body.email.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
          throw new ValidationError("Please enter a valid email address");
        }
        // Check if email is already taken by another user
        const existingUser = await userModel.findOne({ email: update.email, _id: { $ne: userId } });
        if (existingUser) {
          logger.warn("Email already in use", { email: update.email });
          throw new BadRequestError("Email already in use by another user");
        }
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
}
