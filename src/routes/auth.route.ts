import { Router, Request, Response } from "express";
import { signUp, login, forgotPassword} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post('/register', signUp);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);

export default authRouter;