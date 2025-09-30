import { Router, Request, Response } from "express";
import { signUp, login} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post('/register', signUp);
authRouter.post('/login', login);

export default authRouter;