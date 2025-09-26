import { Router, Request, Response } from "express";
import { signUp } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get('/register', signUp)

export default authRouter;