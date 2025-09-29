import { MongooseError } from "mongoose";
import userModel from "../models/user.model";
import { CreateUserBody } from "../types/auth";
import { AuthenticationError, BadRequestError, ValidationError } from "../utils/errors";

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
                    _id: newUser._id
                }
            }
        } catch (err) {
            if (err instanceof MongooseError) {
                throw new BadRequestError(err.message);
            }
        }
    }
}