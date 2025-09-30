import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import categoryRouter from "./category.route";

const appRoutes = Router();

appRoutes.use('/auth', authRouter);
appRoutes.use('/users',userRouter);
appRoutes.use('/category', categoryRouter)

export default appRoutes;