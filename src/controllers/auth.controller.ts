import { NextFunction, Request, Response } from "express"
import AuthService from "../services/auth.service";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errors";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, phone, password, role} = req.body;
        const data = await AuthService.createUser({
            username,
            email,
            phone,
            password,
            role,
            isActive: true
        });
        logger.info("User created successfully");
        res.status(200).json(data);
    } catch (err) {
        console.log({ err });
        if (err instanceof Error) {
            logger.error("Error occurred", { message: err.message });
            // res.status(400).json({ message: error.message });
            next(err);
        } else if(err instanceof AuthenticationError) {
            next(err);
        }
    }
}