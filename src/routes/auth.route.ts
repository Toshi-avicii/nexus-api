import { Router } from "express";
import { signUp, login, forgotPassword, getRefreshToken} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post('/register', signUp);
authRouter.post('/login', login);
authRouter.post('/refresh', getRefreshToken)
authRouter.post('/forgot-password', forgotPassword);

export default authRouter;