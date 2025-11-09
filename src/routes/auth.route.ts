import { Router } from "express";
import { signUp, login, forgotPassword, getRefreshToken, logout} from "../controllers/auth.controller";
import validateResource from "../middlewares/inputValidation.middleware";
import { loginUserSchema, newUserSchema } from "../validations/user.schema";

const authRouter = Router();

authRouter.post('/register', validateResource(newUserSchema), signUp);
authRouter.post('/login', validateResource(loginUserSchema), login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', getRefreshToken);
authRouter.post('/forgot-password', forgotPassword);

export default authRouter;