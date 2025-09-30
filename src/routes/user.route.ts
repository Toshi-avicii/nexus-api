import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getMe, updateMe } from "../controllers/user.controller";


const userRouter = Router();

userRouter.get('/me', verifyToken, getMe);
userRouter.put('/me', verifyToken, updateMe);

export default userRouter;