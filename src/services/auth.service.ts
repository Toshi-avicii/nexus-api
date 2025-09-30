import { MongooseError } from "mongoose";
import userModel from "../models/user.model";
import { CreateUserBody, LoginBody} from "../types/auth";
import {
  AuthenticationError,
  BadRequestError,
  ValidationError,
} from "../utils/errors";
import jwt from "jsonwebtoken";
import config from "../config";
import logger from "../utils/logger";

export default class AuthService {
  static async createUser(body: CreateUserBody) {
    try {
      const newUser = await userModel.create(body);
      if (newUser instanceof Error) {
        throw new Error("Data missing");
      }

      return {
        data: {
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          _id: newUser._id,
        },
      };
    } catch (err) {
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
    }
  }

  static async login(body: LoginBody) {
    console.log(body.email);
    console.log(body.password);

    try {
      // Validate input
      if (!body.email || !body.password) {
        throw new ValidationError("Email and password are required");
      }

      // Find user and include password
      const user = await userModel
        .findOne({ email: body.email })
        .select("+password");
      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }

      // Compare password using user model's comparePassword method
      const isMatch = await user.comparePassword(body.password);
      if (!isMatch) {
        throw new AuthenticationError("Invalid credentials");
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        config.jwtSecret as string,
        { expiresIn: "1h" }
      );

      return {
        data: {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatarUrl,
            address: user.address,
          },
          token,
        },
      };
    } catch (err) {
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err; // Re-throw other errors
    }
  }

}
