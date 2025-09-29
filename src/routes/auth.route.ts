import { Router, Request, Response } from "express";
import { signUp } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post('/register', signUp)

export default authRouter;