import { MongooseError } from "mongoose";
import userModel from "../models/user.model";
import { CreateUserBody, LoginBody } from "../types/auth";
import {
  AuthenticationError,
  BadRequestError,
  CustomError,
  ValidationError,
} from "../utils/errors";
import jwt from "jsonwebtoken";
import config from "../config";
import nodemailer from 'nodemailer';

export default class AuthService {
  static async createUser(body: CreateUserBody) {
    try {
      const newUser = await userModel.create(body);
      if (newUser instanceof Error) {
        throw new Error("Data missing");
      }

      return {
        data: {
          user: {
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            _id: newUser._id,
          }
        },
      };
    } catch (err) {
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
    }
  }

  static async login(body: LoginBody) {
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

      return {
        data: {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatarUrl,
            addresses: user.addresses,
          }
        },
      };
    } catch (err) {
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err; // Re-throw other errors
    }
  }

  static async resetLink({ email }: { email: string }) {
    try {
      const existingUser = await userModel.findOne({ email }, { email: 1, username: 1, _id: 1 });
      if (!existingUser) throw new AuthenticationError("User not found");

      // create a token that will be valid for 15 minutes
      const token = jwt.sign({ id: existingUser._id }, config.accessTokenSecret, { expiresIn: '15m' });
      const saveDataInExistingUser = await userModel.findOneAndUpdate({ email }, { forgotPasswordToken: token }, { new: true });

      if (saveDataInExistingUser) {
        const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
        // sent email to the recepient
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: config.senderMailId,
            pass: config.mailAppPassword
          }
        });

        const mailOptions = {
          from: config.senderMailId,
          to: existingUser.email,
          subject: "Password Reset Request",
          // text: "Hello! This is a test email sent using Nodemailer.",
          html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        return {
          message: "Password reset link sent to email.",
        }
      } else {
        throw new CustomError('Some error occurred');
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new CustomError(err.message, 400);
      }
    }
  }
} 
