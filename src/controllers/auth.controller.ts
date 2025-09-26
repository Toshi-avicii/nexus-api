import { NextFunction, Request, Response } from "express"
import AuthService from "../services/auth.service";
import logger from "../utils/logger";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await AuthService.createUser();
        logger.info("User created successfully");
        res.status(200).json({ data });
    } catch (err) {
        if (err instanceof Error) {
            logger.error("Error occurred", { message: err.message });
            // res.status(400).json({ message: error.message });
            next(err);
        }
    }
}