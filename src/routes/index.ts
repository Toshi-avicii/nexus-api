import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import categoryRouter from "./category.route";
import productRouter from "./product.route";
import orderRouter from "./order.route";
import cartRouter from "./cart.route";
import wishlistRouter from "./wishlist.route";
import couponRouter from "./coupon.route";
import reviewRouter from "./review.route";

const appRoutes = Router();

appRoutes.use("/auth", authRouter);
appRoutes.use("/users", userRouter);
appRoutes.use("/categories", categoryRouter);
appRoutes.use("/products", productRouter);
appRoutes.use("/orders", orderRouter);
appRoutes.use("/cart", cartRouter);
appRoutes.use("/wishlist", wishlistRouter);
appRoutes.use("/coupon", couponRouter);
appRoutes.use("/review", reviewRouter);

export default appRoutes;
