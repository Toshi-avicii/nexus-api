import { Router } from "express";
import authRouter from "./auth.route";

const appRoutes = Router();

appRoutes.use('/auth', authRouter);

export default appRoutes;